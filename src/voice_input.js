/*
 * Imports
 */
var PocketSphinx = require("pocketsphinx");
var Samplerate = require("node-samplerate");
var Util = require("util");
var EventEmitter = require("events").EventEmitter;
/*
 * Defines
 */
var TIMEOUT_THRESHOLD = 100;
var THRESHOLD = -8000;
var HOT_WORD = "okay jenny";
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
	this.sphinx = new PocketSphinx({samprate: SAMPLERATE}, this._onHypothesis.bind(this));
	this.timeout = undefined;
	this.speaking = false;
	this.hypothesis = "";
	this.score = -10000;
	this.sphinx.addGrammarSearch('commands', 'commands.gram');
	this.sphinx.search = 'commands';
	this.bot.mumble.outputStream().on('data', this._speech.bind(this));
};

Util.inherits(VoiceInput, EventEmitter);

VoiceInput.prototype._onHypothesis = function(err, hypothesis, score) {
	if(err) {
		throw err;
	}
	this.hypothesis = hypothesis;
	this.score = score;
};

VoiceInput.prototype._initTimeout = function() {
this.timeout = setTimeout(this._speakingStopped.bind(this), TIMEOUT_THRESHOLD);
};

VoiceInput.prototype._speakingStarted = function() {
	console.log("speaking started");
	this._initTimeout();
	this.speaking = true;
	this.sphinx.start();
};

VoiceInput.prototype._speakingStopped = function() {
	console.log("speaking stopped");
	this.speaking = false;
	this.sphinx.stop();
	if(this.hypothesis !== null && this.hypothesis.startsWith(HOT_WORD) && this.score > THRESHOLD) {
		this._dispatch();
	}
};

VoiceInput.prototype._dispatch = function() {
	this.emit('input', this.hypothesis, this.score);
};

VoiceInput.prototype._speech = function(chunk) {
	var silence = isSilence(chunk);
	if(!silence) {
		if(!this.speaking) {
			this._speakingStarted();
		}
		else {
			clearTimeout(this.timeout);
			this._initTimeout();
			chunk = Samplerate.resample(chunk, 48000, SAMPLERATE, 1);
			this.sphinx.writeSync(chunk);
		}
	}
};

module.exports = VoiceInput;
