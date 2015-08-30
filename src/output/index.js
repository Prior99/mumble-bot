/*
 * Imports
 */

var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var Winston = require('winston');
var Sound = require('./sound');
var Speech = require('./speech');
var Stream = require('stream');
/*
 * Code
 */

/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 * @constructor
 * @param {Bot} bot - Bot this belongs to.
 */
var Output = function(bot) {
	this.bot = bot;
	this.stream = bot.mumble.inputStream();
	this.speech = new Speech(this, bot.options.espeakData, bot.mumble.user.channel, bot.database, bot);
	this.sound = new Sound(this);
	this.busy = false;
	this.queue = [];
	this.current = null;
	Stream.Writable.call(this);
	this._bufferQueue = [];
	this._playbackAhead = 0;
	this.bot.newCommand("change voice", this.changeGender.bind(this), "Deprecated. Changes the gender of the voice.", "venus-mars");
};

Util.inherits(Output, Stream.Writable);

var PREBUFFER = 0.5;

Output.prototype._shiftBuffer = function() {
	if(this._lastBufferShift) {
		var timePassed = (Date.now() - this._lastBufferShift) / 1000;
		this._playbackAhead -= timePassed;
	}
	if(this._bufferQueue.length > 0) {
		var start = Date.now();
		if(this._playbackAhead < 0 && this._lastBufferShift) {
			Winston.warn("Buffer underflow.");
		}
		while(this._playbackAhead < PREBUFFER && this._bufferQueue.length > 0) {
			var b = this._bufferQueue.shift();
			var lengthOfBuffer = (b.length / 2) / 48000;
			this._playbackAhead += lengthOfBuffer;
			this.stream.write(b);
		}
		var waitFor;
		var overfilled = this._playbackAhead - PREBUFFER;
		if(overfilled > 0) {
			waitFor = 1000 * overfilled;
		}
		else {
			waitFor = 100;
		}
		this._timeout = setTimeout(this._shiftBuffer.bind(this), waitFor);
		this._lastBufferShift = Date.now();
	}
	else {
		this._playbackAhead = 0;
		this._lastBufferShift = null;
		this._timeout = null;
	}
};

Output.prototype._write = function(chunk, encoding, done) {
	this._bufferQueue.push(chunk);
	if(!this._timeout) {
		this._shiftBuffer(); //Not currently processing queue? Sleeping? Wake up!
	}
	done();
};

/**
 * Clear the whole queue and stop current playback.
 */
Output.prototype.clear = function() {
	this.queue = [];
	this._bufferQueue = [];
	this.speech.clear();
	this.sound.clear();
};

Output.prototype._next = function() {
	if(!this.busy && this.queue.length !== 0) {
		this.current = this.queue.shift();
		this._process(this.current);
	}
};

Output.prototype._process = function() {
	this._processStarted();
	if(this.current.type === "speech") {
		this.speech.enqueue({
			text : this.current.text,
			print : this.current.print,
			callback : this._processStopped.bind(this)
		});
	}
	else if(this.current.type === "sound") {
		this.sound.enqueue({
			file : this.current.file,
			callback : this._processStopped.bind(this)
		});
	}
	else {
		Winston.error("Unkown type of workitem: \"" + this.current.type + "\"");
		this._processStopped();
	}
};

Output.prototype._processStarted = function() {
	this.busy = true;
	this.emit("start", this.current);
};

Output.prototype._processStopped = function() {
	var callback = this.current.callback;
	this.current = null;
	this.busy = false;
	this.emit("stop");
	if(callback) {
		callback();
	}
	this._next();
};

/**
 * Queue playing back a soundfile. The soundfile needs to be exactly: Raw PCM
 * audio data (*.wav is fine), 44,100Hz and mono-channel.
 * @param {string} file - Name of the soundfile to play.
 * @param callback - Called after the soundfile was played.
 */
Output.prototype.playSound = function(file, callback) {
	this._enqueue({
		type : "sound",
		file : file,
		callback :callback
	});
};

/**
 * Say something using TTS.
 * @param {string} text -  Text to say viw TTS.
 * @param callback - Called after the text was spoken.
 */
Output.prototype.say = function(text, callback) {
	this._enqueue({
		type : "speech",
		print : true,
		text : text,
		callback :callback
	});
};

/**
 * Say something using TTS, don't print it to the chat.
 * @param {string} text -  Text to say viw TTS.
 * @param callback - Called after the text was spoken.
 */
Output.prototype.sayOnlyVoice = function(text, callback) {
	this._enqueue({
		type : "speech",
		print : false,
		text : text,
		callback :callback
	});
};


Output.prototype._enqueue = function(workitem) {
	this.queue.push(workitem);
	if(!this.busy) {
		this._next();
	}
};

/**
 * Changes the voice of the ESpeak TTS from female to male and vice-verse.
 * @deprecated Is no longer needed as Google Translate TTS is now used instead of ESpeak.
 */
Output.prototype.changeGender = function() {
	this.speech.changeGender();
	this.say("Geschlechtsumwandlung erfolgreich.");
};

module.exports = Output;
