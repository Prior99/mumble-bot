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
};

VoiceOutput.prototype.say = function(text) {
	ESpeak.speak(text);
};

module.exports = VoiceOutput;
