/*
 * Imports
 */
var ESpeak = require("node-espeak");
var Samplerate = require("node-samplerate");
var Util = require("util");
var EventEmitter = require("events").EventEmitter;

/*
 * Code
 */
var VoiceOutput = function(bot) {
	this.gender = "male";
	this.bot = bot;
	this._inputStream = bot.mumble.inputStream();
	ESpeak.initialize({
		lang : "en",
		gender : this.gender
	}, {
		rate : 130,
		gap: 1.5
	}, bot.options.espeakData);
	console.log(ESpeak.getVoice());
	ESpeak.onVoice(this._onESpeakVoice.bind(this));
};

Util.inherits(VoiceOutput, EventEmitter);

VoiceOutput.prototype.changeGender = function() {
	if(this.gender === "male") {
		this.gender = "female";
	}
	else {
		this.gender = "male";
	}
	ESpeak.setGender(this.gender);
	this.say("Do you like me more when I speak with a " + this.gender + " voice?");
};

VoiceOutput.prototype._onESpeakVoice = function(wav, samples, samplerate) {
	var resampled = Samplerate.resample(wav, samplerate, 48000, 1);
	this._inputStream.write(resampled);
	var sec = samples / samplerate;
	if(this.speakStopTimeout !== undefined) {
		clearTimeout(this.speakStopTimeout);
	}
	else {
		this.emit('speak-start');
		this.speakWait = 200;
	}
	this.speakWait += sec * 1000;
	this.speakStopTimeout = setTimeout(function() {
		console.log("Speak stop!");
		this.emit('speak-stop');
	}.bind(this), this.speakWait);
};

VoiceOutput.prototype.say = function(text) {
	if(this.bot.music && !this.bot.music.muted) {
		this.bot.music.mute();
		ESpeak.speak(text);
		this.once('speak-stop', function() {
			this.bot.music.unmute();
		}.bind(this));
	}
	else {
		ESpeak.speak(text);
	}
};

module.exports = VoiceOutput;
