/*
 * Imports
 */
var ESpeak = require("node-espeak");
var Samplerate = require("node-samplerate");
var Util = require("util");
var FS = require("fs");
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
	ESpeak.onVoice(this._onESpeakVoice.bind(this));

	this.bot.newCommand("change gender", function() {
		this.bot.voiceOutput.changeGender();
	}.bind(this));
};

Util.inherits(VoiceOutput, EventEmitter);


VoiceOutput.prototype.playSound = function(filename, user, cb) {
	FS.readFile(filename, function(err, data) {
		if(err) {
			throw err;
		}
		if(cb) {
			var time = (data.length / 44100) * 1000 + 200;
			setTimeout(cb, time);
		}
		var stream;
		if(user) {
			stream = user.inputStream();
		}
		else {
			stream = this.bot.mumble.inputStream();
		}
		stream.write(Samplerate.resample(data, 44100, 48000, 2));
	});
};

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
	if(this.speakStopTimeout) {
		clearTimeout(this.speakStopTimeout);
	}
	else {
		this.emit('speak-start');
		this.speaking = true;
		console.log("speaking: ", this.speaking);
		this.speakWait = 200;
	}
	this.speakWait += sec * 1000;
	this.speakStopTimeout = setTimeout(function() {
		this.speakWait = 0;
		this.speaking = false;
		console.log("speaking: ", this.speaking);
		this.emit('speak-stop');
		this.speakStopTimeout = undefined;
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
