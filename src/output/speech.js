/*
 * Imports
 */

var ESpeak = require("node-espeak");
var Samplerate = require("node-samplerate");
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var Winston = require("winston");

/*
 * Code
 */

var Speech = function(stream, espeakData) {
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
	this.busy = false;
	this.current = null;
	this.timeout = null;
	this.speaking = false;
	this.muted = false;
};

Util.inherits(Speech, EventEmitter);

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
	this.next();
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

Speech.prototype.mute = function() {
	this.muted = true;
};

Speech.prototype.unmute = function() {
	this.muted = false;
};

Speech.prototype.changeGender = function() {
	if(this.gender === "male") {
		this.gender = "female";
	}
	else {
		this.gender = "male";
	}
	ESpeak.setGender(this.gender);
};

Speech.prototype.next = function() {
	if(!this.speaking && this.queue.length !== 0) {
		this.current = this.queue.shift();
		ESpeak.speak(this.current.text);
		Winston.info("Speaking:\"" + this.current.text + "\"");
	}
};

Speech.prototype.enqueue = function(workitem) {
	this.queue.push(workitem);
	if(!this.speaking) {
		this.next();
	}
};

module.exports = Speech;
