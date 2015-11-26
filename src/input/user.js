/*
 * Imports
 */

var Samplerate = require("node-samplerate");
var Winston = require('winston');
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var FS = require("fs");
var Lame = require("lame");
var Stream = require('stream');
var Util = require('util');

/*
 * Defines
 */

var TIMEOUT_THRESHOLD = 300;

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
 * @constructor
 * @param user - Mumble user to recognize the speech of.
 * @param databaseUser - ??
 * @param bot - ??
 */
var VoiceInputUser = function(user, databaseUser, bot) {
	this._user = user;
	this.bot = bot;
	this._databaseUser = databaseUser;
	this.speaking = false;
	Stream.Writable.call(this);
	this._createNewRecordFile();
	this._connectTime = new Date();
	this._user.on('disconnect', this._onDisconnect.bind(this));
};

Util.inherits(VoiceInputUser, Stream.Writable);

/**
 * Feed raw PCM audio data captured from mumble to this user.
 * @param chunk - Buffer of raw PCM audio data.
 */
VoiceInputUser.prototype._write = function(chunk, encoding, done) {
	if(!this.speaking) {
		this._speechStarted();
	}
	this._speechContinued(chunk);
	done();
};

VoiceInputUser.prototype._onDisconnect = function() {
	this.bot.database.writeUserStatsOnline(this._databaseUser, this._connectTime, new Date());
};

VoiceInputUser.prototype._refreshTimeout = function() {
	if(this._timeout) {
		clearTimeout(this._timeout);
	}
	this._timeout = setTimeout(this._speechStopped.bind(this), TIMEOUT_THRESHOLD);
};

VoiceInputUser.prototype._speechStarted = function() {
	this.speaking = true;
	this._speakStartTime = new Date();
};

VoiceInputUser.prototype._createNewRecordFile = function() {
	if(this._databaseUser.settings.record === true) {
		try { FS.mkdirSync('tmp'); } catch(err) { }
		try { FS.mkdirSync('tmp/useraudio'); } catch(err) { }
		try { FS.mkdirSync('tmp/useraudio/' + this._user.id); } catch(err) { }
		this._filename = 'tmp/useraudio/' + this._user.id + '/' + Date.now() + '.mp3';
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
};

VoiceInputUser.prototype._speechStopped = function() {
	this.speaking = false;
	this.started = false;
	if(this._databaseUser.settings.record === true) {
		this._encoder.end();
		this.bot.addCachedAudio(this._filename, this._databaseUser, (Date.now() - this._speakStartTime.getTime())/1000);
		this._createNewRecordFile();
	}
	this.bot.database.writeUserStatsSpeak(this._databaseUser, this._speakStartTime, new Date());
};

VoiceInputUser.prototype._speechContinued = function(chunk) {
	if(this._databaseUser.settings.record === true) {
		this._encoder.write(chunk);
	}
	this._refreshTimeout();
};

module.exports = VoiceInputUser;
