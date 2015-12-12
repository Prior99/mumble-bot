/*
 * Imports
 */

import Util from "util";
import EventEmitter from "events";
import Winston from "winston";
import Sound from "./sound";
import Speech from "./speech";
import Stream from "stream";

/*
 * Code
 */


/**
 * Audio output for the bot. This class handles the whole audio output,
 * including both TTS and sounds.
 */
class Output extends Stream.Writable {

	/**
	 * @constructor
	 * @param {Bot} bot - Bot this belongs to.
	 */
	constructor(bot) {
		super(); // TODO
		Stream.Writable.call(this);
		this.bot = bot;
		this.stream = bot.mumble.inputStream();
		this.speech = new Speech(this, bot.options.espeakData, bot.mumble.user.channel, bot.database, bot);
		this.sound = new Sound(this);
		this.busy = false;
		this.queue = [];
		this.current = null;
		this._bufferQueue = [];
		this._playbackAhead = 0;
		this.bot.newCommand("change voice", this.changeGender.bind(this),
			"Deprecated. Changes the gender of the voice.", "venus-mars");

		this.PREBUFFER = 0.5;
	}
	//var PREBUFFER = 0.5; TODO see above

	/**
	 * TODO
	 * @returns {undefined}
	 */
	_shiftBuffer() {
		if(this._lastBufferShift) {
			const timePassed = (Date.now() - this._lastBufferShift) / msInS;
			this._playbackAhead -= timePassed;
		}
		if(this._bufferQueue.length > 0) {
			const start = Date.now();
			if(this._playbackAhead < 0 && this._lastBufferShift) {
				Winston.warn("Buffer underflow.");
			}
			while(this._playbackAhead < PREBUFFER && this._bufferQueue.length > 0) {
				const b = this._bufferQueue.shift();
				const lengthOfBuffer = (b.length / 2) / audioFreq;
				this._playbackAhead += lengthOfBuffer;
				this.stream.write(b);
			}
			let waitFor;
			const overfilled = this._playbackAhead - PREBUFFER;
			if(overfilled > 0) {
				waitFor = msInS * overfilled;
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
	}

	/**
	 * @returns {undefined}
	 */
	_write(chunk, encoding, done) {
		this._bufferQueue.push(chunk);
		if(!this._timeout) {
			this._shiftBuffer(); //Not currently processing queue? Sleeping? Wake up!
		}
		done();
	}

	/**
	 * Clear the whole queue and stop current playback.
	 * @returns {undefined}
	 */
	clear() {
		this.queue = [];
		this._bufferQueue = [];
		this.speech.clear();
		this.sound.clear();
	}

	/**
	 * Start processing the next item in the queue.
	 * @returns {undefined}
	 */
	_next() {
		if(!this.busy && this.queue.length !== 0) {
			this.current = this.queue.shift();
			this._process(this.current);
		}
	}

	/**
	 * Process the next item.
	 * @returns {undefined}
	 */
	_process() {
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
	}

	/**
	 * When processing the next item started.
	 * @returns {undefined}
	 */
	_processStarted() {
		this.busy = true;
		this.emit("start", this.current);
	}

	/**
	 * When processing stopped.
	 * @returns {undefined}
	 */
	_processStopped() {
		const callback = this.current.callback;
		this.current = null;
		this.busy = false;
		this.emit("stop");
		if(callback) {
			callback();
		}
		this._next();
	}

	/**
	 * Queue playing back a soundfile. The soundfile needs to be exactly: Raw PCM
	 * audio data (*.wav is fine), 44,100Hz and mono-channel.
	 * @param {string} file - Name of the soundfile to play.
	 * @param {function} callback - Called after the soundfile was played. TODO type
	 * @returns {undefined}
	 */
	playSound(file, callback) {
		this._enqueue({
			type : "sound",
			file,
			callback
		});
	}

	/**
	 * Also enqueues sounds, but many at once (atomically?)
	 * @param {string[]} filelist - The files to be played.
	 * @returns {undefined}
	 */
	playSounds(filelist) { // callback TODO?
		for(let i=0; i<filelist.length; i++) {
			this._enqueue({
				type : "sound",
				file : filelist[i]
			});
		}
	}

	/**
	 * Say something using TTS.
	 * @param {string} text -  Text to say viw TTS.
	 * @param {function} callback - Called after the text was spoken. TODO type
	 * @returns {undefined}
	 */
	say(text, callback) {
		this._enqueue({
			type : "speech",
			print : true,
			text,
			callback
		});
	}

	/**
	 * Say something using TTS, don't print it to the chat.
	 * @param {string} text -  Text to say viw TTS.
	 * @param {function} callback - Called after the text was spoken. TODO type
	 * @returns {undefined}
	 */
	sayOnlyVoice(text, callback) {
		this._enqueue({
			type : "speech",
			print : false,
			text,
			callback
		});
	}

	/**
	 * Enqueues a work item.
	 * @param {object} workitem - The object to be enqueued.
	 * @returns {undefined}
	 */
	_enqueue(workitem) {
		this.queue.push(workitem);
		if(!this.busy) {
			this._next();
		}
	}

	/**
	 * Changes the voice of the ESpeak TTS from female to male and vice-verse.
	 * @deprecated Is no longer needed as Google Translate TTS is now used instead of ESpeak.
	 * @returns {undefined}
	 */
	changeGender() {
		this.speech.changeGender();
		this.say("Geschlechtsumwandlung erfolgreich.");
	}
}

module.exports = Output;
