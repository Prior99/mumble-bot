/*
 * Imports
 */

import Samplerate from "node-samplerate";
import Winston from "winston"
import Util from "util";
import EventEmitter from "events";
import FS from "fs";
import Lame from "lame";
import Stream from "stream";

/*
 * Defines
 */

const TIMEOUT_THRESHOLD = 300;

const msInS = 1000;

/*
 * Polyfills
 */

if(!String.prototype.startsWith) {
	String.prototype.startsWith = function(searchString, position) {
		position = position || 0;
		return this.lastIndexOf(searchString, position) === position;
	};
}

/*
 * Code
 */

/**
 * This class belongs to the VoiceInput and handles the speech recognition for a
 * single user.
 */
class VoiceInputUser extends EventEmitter {
	/**
	 * @constructor
	 * @param {MumbleUser} user - Mumble user to recognize the speech of.
	 * @param {DatabaseUser} databaseUser - The user from the database.
	 * @param {Bot} bot - The bot instance this user belongs to.
	 */
	constructor(user, databaseUser, bot) {
		super();
		this._user = user;
		this.bot = bot;
		this._databaseUser = databaseUser;
		this.speaking = false;
		Stream.Writable.call(this);
		this._createNewRecordFile();
		this._connectTime = new Date();
		this._user.on("disconnect", this._onDisconnect.bind(this));
	}

	/**
	 * Feed raw PCM audio data captured from mumble to this user.
	 * @param {array} chunk - Buffer of raw PCM audio data.
	 * @param {string} encoding - unused.
	 * @param {function} done - callback.
	 * @returns {undefined}
	 */
	_write(chunk, encoding, done) {
		if(!this.speaking) {
			this._speechStarted();
		}
		this._speechContinued(chunk);
		done();
	}

	/**
	 * Called when user disconnects.
	 * Updates the stats.
	 * @returns {undefined}
	 */
	_onDisconnect() {
		this.bot.database.writeUserStatsOnline(this._databaseUser, this._connectTime, new Date());
	}

	/**
	 * Refreshes the timeout of silence after which the audio will be sliced into different records.
	 * @returns {undefined}
	 */
	_refreshTimeout() {
		if(this._timeout) {
			clearTimeout(this._timeout);
		}
		this._timeout = setTimeout(this._speechStopped.bind(this), TIMEOUT_THRESHOLD);
	}

	/**
	 * When user started speaking.
	 * @returns {undefined}
	 */
	_speechStarted() {
		this.speaking = true;
		this._speakStartTime = new Date();
	}

	/**
	 * Creates a new temporary record file.
	 * @returns {undefined}
	 */
	_createNewRecordFile() {
		if(this._databaseUser.settings.record === true) {
			try {
				FS.mkdirSync("tmp");
			}
			catch(err) {
				Winston.error(err);
			}
			try {
				FS.mkdirSync("tmp/useraudio");
			}
			catch(err) {
				Winston.error(err);
			}
			try {
				FS.mkdirSync("tmp/useraudio/" + this._user.id);
			}
			catch(err) {
				Winston.error(err);
			}
			this._filename = "tmp/useraudio/" + this._user.id + "/" + Date.now() + ".mp3";
			this._encoder = new Lame.Encoder({
				channels : 1,
				bitDepth : 16,
				sampleRate : 48000,
				bitRate : 128,
				outSampleRate : 44100,
				mode : Lame.MONO
			});
			this._recordStream = FS.createWriteStream(this._filename);
			this._encoder.pipe(this._recordStream);
		}
	}

	/**
	 * When user stopped speaking.
	 * @returns {undefined}
	 */
	_speechStopped() {
		this.speaking = false;
		this.started = false;
		if(this._databaseUser.settings.record === true) {
			this._encoder.end();
			this.bot.addCachedAudio(
				this._filename,
				this._databaseUser,
				(Date.now() - this._speakStartTime.getTime()) / msInS
			);
			this._createNewRecordFile();
		}
		this.bot.database.writeUserStatsSpeak(this._databaseUser, this._speakStartTime, new Date());
	}

	/**
	 * When user continues speaking this method will be called,
	 * the audio will be encoded and the timeout will be refreshed.
	 * @param {Buffer} chunk - The user's speech buffer.
	 * @returns {undefined}
	 */
	_speechContinued(chunk) {
		if(this._databaseUser.settings.record === true) {
			this._encoder.write(chunk);
		}
		this._refreshTimeout();
	}
}

module.exports = VoiceInputUser;
