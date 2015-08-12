/*
 * Imports
 */

var ESpeak = require("node-espeak");
var Request = require("request");
var Lame = require("lame");
var Samplerate = require("node-samplerate");
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var Winston = require("winston");
var GoogleTTS = require("./googletranslatetts");
var BingTTS = require("./bingtranslatetts");

/*
 * Code
 */

/**
 * Handles the TTS for the bot. This class is intended to be used by Output and
 * not to be used seperatly.
 * @constructor
 * @param {WriteableStream} stream - Stream to write audio data to.
 * @param {string} espeakData - Path to ESpeak data directory.
 * @param channel - Mumble channel this bot is currently in to send text as chat
 * 				    message to. This is really not a good idea to happen here
 * 					should be changed asap.
 * @param {Database} database - Instance of the database to work with for Google
 *								Translate TTS cache.
 */
var Speech = function(stream, espeakData, channel, database, bot) {
	this.queue = [];
	this.gender = "female";
	ESpeak.initialize({
		lang : "de",
		gender : this.gender
	}, {
		rate : 130,
		gap: 1.5
	}, espeakData);
	ESpeak.onVoice(this._onESpeakData.bind(this));
	this.stream = stream;
	this.engine = "google";
	if(bot.options.bingTTS) {
		this._bingEngine = BingTTS(bot.options.bingTTS.clientID, bot.options.bingTTS.clientSecret, database);
		this._bingEngine.on('data', this._onTTSData.bind(this));
		this._bingEngine.setGender("female");
		this._bingEngine.on('speechDone', function() {
			this._speakingStopped();
		}.bind(this));
		this.engine = "bing";
	}
	this._googleEngine = GoogleTTS(database);
	this._googleEngine.on('data', this._onTTSData.bind(this));
	this._googleEngine.on('speechDone', function() {
		this._speakingStopped();
	}.bind(this));
	this.busy = false;
	this.current = null;
	this.timeout = null;
	this.speaking = false;
	this.muted = false;
	this.channel = channel;
};

Util.inherits(Speech, EventEmitter);

/**
 * Clear the whole queue and stop current playback.
 */
Speech.prototype.clear = function() {
	this.queue.splice(0, this.queue.length);
};

Speech.prototype._refreshTimeout = function() {
	if(this.timeout) {
		clearTimeout(this.timeout);
	}
	this.timeout = setTimeout(this._speakingStopped.bind(this), this.speakTimeoutDuration);
};

Speech.prototype._speakingStopped = function() {
	this.speakTimeoutDuration = 0;
	this.speaking = false;
	this.timeout = null;
	this.emit("stop", this.current);
	var callback = this.current.callback;
	this.current = null;
	this._next();
	if(callback) {
		callback();
	}
};

Speech.prototype._speakingStarted = function() {
	this.speaking = true;
	this.speakTimeoutDuration = 100;
	this.emit("start", this.current);
};

Speech.prototype._onESpeakData = function(data, samples, samplerate) {
	if(!this.speaking) {
		this._speakingStarted();
	}
	var resampledData = Samplerate.resample(data, samplerate, 48000, 1);
	if(!this.muted) {
		this.stream.write(resampledData);
	}
	var durationSeconds = samples / samplerate;
	this.speakTimeoutDuration += durationSeconds * 1000;
	this._refreshTimeout();
};

Speech.prototype._onTTSData = function(data) {
	if(!this.speaking) {
		this._speakingStarted();
	}
	var resampledData = Samplerate.resample(data, this._currentEngine.samplerate, 48000, 1);
	if(!this.muted) {
		this.stream.write(resampledData);
	}
};

/**
 * Mute the playback of TTS data.
 */
Speech.prototype.mute = function() {
	console.log("mute");
	this.muted = true;
};

/**
 * Unmute the playback of TTS data.
 */
Speech.prototype.unmute = function() {
	this.muted = false;
};

/**
 * Changes the gender of the ESpeak TTS module from male to female and
 * vice-verse. Has no effect on the gender of the Google Translate TTS.
 */
Speech.prototype.changeGender = function() {
	if(this.gender === "male") {
		this.gender = "female";
	}
	else {
		this.gender = "male";
	}
	this._bingEngine.setGender(this.gender);
	ESpeak.setGender(this.gender);
};

/**
 * Synthesize a text specificly using ESpeak.
 * @param {string} text - Text to synthesize.
 */
Speech.prototype.speakUsingESpeak = function(text) {
	this._currentEngine = null;
	ESpeak.speak(this.current.text);
};

Speech.prototype._onGoogleTTSError = function(err, text) {
	Winston.error("Received error from google tts. Using ESpeak instead. " + err);
	this.speakUsingESpeak(text);
};

Speech.prototype._onBingTTSError = function(err, text) {
	Winston.error("Received error from bing tts. Using Google instead. " + err);
	this.speakUsingGoogle(text);
};

/**
 * Synthesize a text specificly using Google Translate TTS.
 * @param {string} text - Text to synthesize.
 */
Speech.prototype.speakUsingGoogle = function(text) {
	this._currentEngine = this._googleEngine;
	this._googleEngine.removeAllListeners('error'); //TODO: This is a nasty dirty piece of shit code line
	this._googleEngine.on('error', function(err) {
		this._onGoogleTTSError(err, text);
	}.bind(this));
	this._googleEngine.tts(text);
};

Speech.prototype.speakUsingBing = function(text) {
	this._currentEngine = this._bingEngine;
	this._bingEngine.removeAllListeners('error'); //TODO: This is a nasty dirty piece of shit code line
	this._bingEngine.on('error', function(err) {
		this._onBingTTSError(err, text);
	}.bind(this));
	this._bingEngine.tts(text);
};

Speech.prototype._next = function() {
	if(!this.speaking && this.queue.length !== 0) {
		this.current = this.queue.shift();
		if(this.engine === "google") {
			this.speakUsingGoogle(this.current.text);
		}
		else if(this.engine === "espeak") {
			this.speakUsingESpeak(this.current.text);
		}
		else if(this.engine == "bing") {
			this.speakUsingBing(this.current.text);
		}
		Winston.info("Speaking:\"" + this.current.text + "\"");
		this.channel.sendMessage(this.current.text);
	}
};

/**
 * Enqueue a work item to be processed in the queue and being synthesized
 * later on.
 * @param workitem - Workitem to enqueue containing text to synthesize as well
 * 					 as a callback to call once the text was spoken.
 */
Speech.prototype.enqueue = function(workitem) {
	this.queue.push(workitem);
	if(!this.speaking) {
		this._next();
	}
};

module.exports = Speech;
