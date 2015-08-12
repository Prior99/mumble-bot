/*
 * Imports
 */

var Samplerate = require("node-samplerate");
var Util = require("util");
var Winston = require('winston');
var FS = require("fs");
var EventEmitter = require("events").EventEmitter;
var FFMpeg = require('fluent-ffmpeg');

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
	var samplesTotal = 0;
	var startTime = Date.now();
	this._playbackStarted();
	this._ffmpeg = FFMpeg(filename)
	.format('s16le')
	.audioChannels(1)
	.audioFrequency(48000);
	this._ffmpeg.stream().on('data', function(chunk) {
		samplesTotal += chunk.length / 2;
		this.stream.write(chunk);
	}.bind(this))
	.on('end', function() {
		var timeAlreadyTaken = Date.now() - startTime;
		var totalTime = (samplesTotal / 48000) * 1000;
		var waitTime = totalTime - timeAlreadyTaken;
		this._timeout = setTimeout(this._playbackStopped.bind(this), waitTime);
	}.bind(this));
};

/**
 * Clear the whole queue and stop current playback.
 */
Sound.prototype.clear = function() {
	this.queue = [];
	if(this._timeout) {
		clearTimeout(this._timeout);
		this._timeout = null;
	}
	if(this._ffmpeg) {
		this._ffmpeg.kill();
	}
	this._playbackStopped();
};

Sound.prototype._playbackStarted = function() {
	this.playing = true;
	this.emit("start");
};

Sound.prototype._playbackStopped = function() {
	this.playing = false;
	if(this.current) {
		this.emit("stop");
		var callback = this.current.callback;
		this.current = null;
		this._next();
		if(callback) {
			callback();
		}
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
