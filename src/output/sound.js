/*
 * Imports
 */

var Samplerate = require("node-samplerate");
var Util = require("util");
var Winston = require('winston');
var FS = require("fs");
var EventEmitter = require("events").EventEmitter;

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

Sound.prototype._playbackStarted = function() {
	this.playing = true;
	this.emit("start");
};

Sound.prototype._playbackStopped = function() {
	this.playing = false;
	this.emit("stop");
	var callback = this.current.callback;
	this.current = null;
	this.next();
	if(callback) {
		callback();
	}
};

Sound.prototype.next = function() {
	if(!this.playing && this.queue.length !== 0) {
		this.current = this.queue.shift();
		this._play(this.current.file);
	}
};

Sound.prototype.enqueue = function(workitem) {
	this.queue.push(workitem);
	if(!this.playing) {
		this.next();
	}
};

module.exports = Sound;
