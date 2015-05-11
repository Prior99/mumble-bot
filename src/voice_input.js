/*
 * Imports
 */
var PocketSphinx = require("pocketsphinx");
var Samplerate = require("node-samplerate");
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var Winston = require('winston');
/*
 * Defines
 */
var TIMEOUT_THRESHOLD = 100;
var THRESHOLD = -8000;
var SAMPLERATE = 16000;
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

function isSilence(buffer) {
	var flag = true;
	for(var i = 0; i < buffer.length; i++) {
		if(buffer[i] > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}


var VoiceInput = function(bot) {
	this.bot = bot;
	this.users = {};
	var users = bot.mumble.users();
	for(var u in users) {
		this._addUser(users[u]);
	}
	Winston.info("Module started: Voice input");
};

Util.inherits(VoiceInput, EventEmitter);

VoiceInput.prototype._addUser = function(user) {
	var wrapper = {
		user: user,
		hypothesis: "",
		score: -10000,
		speaking: false
		//timeout
	};
	var sphinx = new PocketSphinx({samprate: SAMPLERATE, logfn : "sphinx.log"}, function(err, hypothesis, score) {
		this._onHypothesis(err, hypothesis, score, wrapper)
	}.bind(this));
	sphinx.addGrammarSearch('commands', 'commands.gram');
	sphinx.search = 'commands';
	wrapper.sphinx = sphinx;
	this.users[user.id] = wrapper;
	user.outputStream(true).on('data', function(chunk) {
		if(!isSilence(chunk)) {
			console.log("VOICE FROM: " + user.name);
			this._speech(wrapper, chunk);
		}
	}.bind(this));
};

VoiceInput.prototype._onHypothesis = function(err, hypothesis, score, user) {
	if(err) {
		throw err;
	}
	user.hypothesis = hypothesis;
	user.score = score;
};

VoiceInput.prototype._initTimeout = function(user) {
	user.timeout = setTimeout(function() {
		this._speakingStopped(user);
	}.bind(this), TIMEOUT_THRESHOLD);
};

VoiceInput.prototype._speakingStarted = function(user) {
	this._initTimeout(user);
	user.speaking = true;
	user.sphinx.start();
		console.log("Started");
	this.bot.playSound("sounds/recognition_started.wav", user.user);
	this.occupiedBy = user;
};

VoiceInput.prototype._speakingStopped = function(user) {
	user.speaking = false;
	user.sphinx.stop();
	user.ignore = true;
		console.log("Stopped");
	if(user.hypothesis !== null && user.hypothesis.startsWith(this.bot.hotword) && user.score > THRESHOLD) {
		this._dispatch(user);
	}
	else {
		this.bot.playSound("sounds/recognition_failure.wav", user.user, function() {
			user.ignore = false;
			this.occupiedBy = undefined;
		}.bind(this));
	}
};

VoiceInput.prototype._dispatch = function(user) {
	this.bot.playSound("sounds/recognition_success.wav", user.user, function() {
		user.ignore = false;
		this.occupiedBy = undefined;
		var hypothesis = user.hypothesis;
		user.hypothesis = undefined;
		this.emit('input', hypothesis, user.score, user.user);
	}.bind(this));
};

VoiceInput.prototype._speech = function(user, chunk) {
	console.log("HYPO:" + user.hypothesis);
	console.log("CHUNK:", chunk);
	if(this.occupiedBy && this.occupiedBy !== user) {
		if(!user.lastAlert || user.lastAlert === 0 || Date.now() - user.lastAlert > 4000) {
			user.lastAlert = Date.now();
			this.bot.playSound("sounds/recognition_ignored.wav", user.user);
		}
		return;
	}
	if(user.ignore || this.bot.voiceOutput.speaking) {
		return;
	}
	if(!user.speaking) {
		this._speakingStarted(user);
	}
	else {
		clearTimeout(user.timeout);
		this._initTimeout(user);
		chunk = Samplerate.resample(chunk, 48000, SAMPLERATE, 1);
		user.sphinx.writeSync(chunk);
	}
};

module.exports = VoiceInput;
