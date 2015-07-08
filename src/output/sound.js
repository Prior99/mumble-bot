/*
 * Imports
 */

var Samplerate = require("node-samplerate");
var Util = require("util");
var Winston = require('winston');
var FS = require("fs");
var EventEmitter = require("events").EventEmitter;

/**
 * Handles playing back raw PCM audio soundfiles (WAV). Those need to be exactly
 * 44,100Hz and mono-channel. This class is used by Output and is not intended
 * to be used seperatly.
 * @constructor
 * @param {WritableStream} stream - Stream to write the audio data to.
 */
var Sound = function(stream) {
	this.playing = false;
	this.stream = stream;
	this.current = null;
	this.queue = [];
};

Util.inherits(Sound, EventEmitter);

Sound.prototype._play = function(filename) {
	this._playbackStarted();
	FS.readFile(filename, function(err, data) {
		if(err) {
			Winston.error(err);
			return;
		}
		var playTimeoutDuration = (data.length / 44100) * 1000;
		this.stream.write(Samplerate.resample(data, 44100, 48000, 1));
		this.timeout = setTimeout(this._playbackStopped.bind(this), playTimeoutDuration);
	}.bind(this));
};

/**
 * Clear the whole queue and stop current playback.
 */
Sound.prototype.clear = function() {
	this.queue.splice(0, this.queue.length);
};

Sound.prototype._playbackStarted = function() {
	this.playing = true;
	this.emit("start");
};

Sound.prototype._playbackStopped = function() {
	this.playing = false;
	this.emit("stop");
	var callback = this.current.callback;
	this.current = null;
	this._next();
	if(callback) {
		callback();
	}
};

Sound.prototype._next = function() {
	if(!this.playing && this.queue.length !== 0) {
		this.current = this.queue.shift();
		this._play(this.current.file);
	}
};

/**
 * Enqueue a new workitem to play back when queue is processed.
 * @param workitem - Workitem to enqueue containing the filename of the
 *					 soundfile.
 */
Sound.prototype.enqueue = function(workitem) {
	this.queue.push(workitem);
	if(!this.playing) {
		this._next();
	}
};

module.exports = Sound;
