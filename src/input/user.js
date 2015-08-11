/*
 * Imports
 */

var Samplerate = require("node-samplerate");
var Winston = require('winston');
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var FS = require("fs");
var Lame = require("lame");

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
 * @param {string} hotword - Hotword to start recognition by.
 */
var VoiceInputUser = function(user, databaseUser, bot) {
	this._user = user;
	this.bot = bot;
	this._databaseUser = databaseUser;
	this.speaking = false;
	this._currentAudioBuffers = [];
};

Util.inherits(VoiceInputUser, EventEmitter);

/**
 * Feed raw PCM audio data captured from mumble to this user.
 * @param chunk - Buffer of raw PCM audio data.
 */
VoiceInputUser.prototype.data = function(chunk) {
	this._onAudio(chunk);
};

VoiceInputUser.prototype._refreshTimeout = function() {
	if(this._timeout) {
		clearTimeout(this._timeout);
	}
	this._timeout = setTimeout(this._speechStopped.bind(this), TIMEOUT_THRESHOLD);
};

VoiceInputUser.prototype._speechStarted = function() {
	this.speaking = true;
	this._speakStartTime = Date.now();
};

VoiceInputUser.prototype._speechStopped = function() {
	this.speaking = false;
	this.started = false;
	try { FS.mkdirSync('tmp'); } catch(err) { }
	try { FS.mkdirSync('tmp/useraudio'); } catch(err) { }
	try { FS.mkdirSync('tmp/useraudio/' + this._user.id); } catch(err) { }
	var filename = 'tmp/useraudio/' + this._user.id + '/' + Date.now() + '.mp3';
	var bufferStream = FS.createWriteStream(filename);
	var encoder = new Lame.Encoder({
		channels : 1,
		bitDepth : 16,
		sampleRate : 48000,
		bitRate : 128,
		outSampleRate : 44100,
		mode : Lame.MONO
	});
	encoder.pipe(bufferStream);
	while(this._currentAudioBuffers.length > 0) {
		encoder.write(this._currentAudioBuffers.shift());
	}
	encoder.end();
	this.bot.addCachedAudio(filename, this._databaseUser, (Date.now() - this._speakStartTime)/1000);
};

VoiceInputUser.prototype._speechContinued = function(chunk) {
	this._currentAudioBuffers.push(chunk);
	this._refreshTimeout();
};


VoiceInputUser.prototype._onAudio = function(chunk) {
	if(!this.speaking) {
		this._speechStarted();
	}
	this._speechContinued(chunk);
};

module.exports = VoiceInputUser;
