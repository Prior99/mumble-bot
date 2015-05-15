/*
 * Imports
 */

var PocketSphinx = require("pocketsphinx");
var Samplerate = require("node-samplerate");
var Winston = require('winston');
var Util = require("util");
var EventEmitter = require("events").EventEmitter;

/*
 * Defines
 */

var TIMEOUT_THRESHOLD = 100;
var HOT_WORD_THRESHOLD = -2000;
var THRESHOLD = -8000;
var SAMPLERATE = 24000;

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

var User = function(user, hotword) {
	this.hotword = hotword;
	this._user = user;
	this.sphinx = new PocketSphinx({samprate: SAMPLERATE, logfn : "sphinx.log"}, this._onHypothesis.bind(this));
	this.sphinx.addGrammarSearch('commands', 'commands.gram');
	this.sphinx.search = 'commands';
	this.speaking = false;
	this.hypothesis = "";
};

Util.inherits(User, EventEmitter);

User.prototype.data = function(chunk) {
	this._onAudio(chunk);
};

User.prototype._refreshTimeout = function() {
	if(this._timeout) {
		clearTimeout(this._timeout);
	}
	this._timeout = setTimeout(this._speechStopped.bind(this), TIMEOUT_THRESHOLD);
};

User.prototype._speechStarted = function() {
	this.speaking = true;
	this.sphinx.start();
};

User.prototype._speechStopped = function() {
	this.speaking = false;
	this.sphinx.stop();
	this._processSpeech();
	this.hypothesis = "";
	this.started = false;
};

User.prototype._processSpeech = function() {
	if(this.hypothesis === null || this.hypothesis === "" || !this.started) {
		return;
	}
	else {
		if(this.hypothesis.startsWith(this.hotword) && this.score >= THRESHOLD) {
			this._dispatchSuccess();
		}
		else {
			this._dispatchFailure();
		}
	}
};

User.prototype._dispatchSuccess = function() {
	this.emit("success", this.hypothesis);
};

User.prototype._dispatchFailure = function() {
	this.emit("failure");
};

User.prototype._speechContinued = function(chunk) {
	this._refreshTimeout();
	chunk = Samplerate.resample(chunk, 48000, SAMPLERATE, 1);
	this.sphinx.writeSync(chunk);
};

User.prototype._onHypothesis = function(err, hypothesis, score) {
	if(hypothesis !== this.hypothesis && hypothesis === this.hotword && this.score >= HOT_WORD_THRESHOLD) {
		this.started = true;
		this.emit("started");
	}
	this.hypothesis = hypothesis;
	this.score = score;
};

User.prototype._onAudio = function(chunk) {
	if(!this.speaking) {
		this._speechStarted();
	}
	this._speechContinued(chunk);
};

module.exports = User;
