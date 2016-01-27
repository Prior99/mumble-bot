import Samplerate from "node-samplerate";
import Winston from "winston"
import Util from "util";
import EventEmitter from "events";
import FS from "fs";
import FFMpeg from "fluent-ffmpeg";
import Stream from "stream";
import {PassThrough as PassThroughStream} from "stream";

const TIMEOUT_THRESHOLD = 300;
const msInS = 1000;
const audioFreq = 48000;

if(!String.prototype.startsWith) {
	String.prototype.startsWith = function(searchString, position) {
		position = position || 0;
		return this.lastIndexOf(searchString, position) === position;
	};
}

/**
 * This class belongs to the VoiceInput and handles the speech recognition for a
 * single user.
 */
class VoiceInputUser extends Stream.Writable {
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
			catch(err) { /* Ignored */ }
			try {
				FS.mkdirSync("tmp/useraudio");
			}
			catch(err) { /* Ignored */ }
			try {
				FS.mkdirSync("tmp/useraudio/" + this._user.id);
			}
			catch(err) { /* Ignored */ }
			this._filename = "tmp/useraudio/" + this._user.id + "/" + Date.now() + ".mp3";
			this._passthrough = new PassThroughStream();
			this._encoder = FFMpeg(this._passthrough)
			.inputOptions(
				"-f", "s16le",
				"-ar", audioFreq,
				"-ac", "1"
			)
			.audioCodec("libmp3lame")
			.save(this._filename);
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
			this._passthrough.end();
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
			this._passthrough.write(chunk);
		}
		this._refreshTimeout();
	}

	/**
	 * Stop all timeouts and shutdown everything.
	 * @return {undefined}
	 */
	stop() {
		this._encoder.kill();
		this.end();
		if(this._timeout) {
			clearTimeout(this._timeout);
		}
		Winston.info("Input stopped for user " + this._user.name);
	}
}

module.exports = VoiceInputUser;
