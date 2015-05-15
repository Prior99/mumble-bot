/*
 * Imports
 */

var Util = require("util");
var EventEmitter = require("events").EventEmitter;
var Winston = require('winston');
var Sound = require('./sound');
var Speech = require('./speech');
/*
 * Code
 */

var Output = function(bot) {
	this.bot = bot;
	this.speech = new Speech(bot.mumble.inputStream(), bot.options.espeakData);
	this.sound = new Sound(bot.mumble.inputStream());
	this.busy = false;
	this.queue = [];
	this.current = null;

	this.bot.newCommand("change voice", this.changeGender.bind(this));
};

Util.inherits(Output, EventEmitter);

Output.prototype.next = function() {
	if(!this.busy && this.queue.length !== 0) {
		this.current = this.queue.shift();
		this._process(this.current);
	}
};

Output.prototype._process = function() {
	this._processStarted();
	if(this.current.type === "speech") {
		this.speech.enqueue({
			text : this.current.text,
			callback : this._processStopped.bind(this)
		});
	}
	else if(this.current.type === "sound") {
		this.sound.enqueue({
			file : this.current.file,
			callback : this._processStopped.bind(this)
		});
	}
	else {
		Winston.error("Unkown type of workitem: \"" + this.current.type + "\"");
		this._processStopped();
	}
};

Output.prototype._processStarted = function() {
	this.busy = true;
	this.emit("start", this.current);
};

Output.prototype._processStopped = function() {
	var callback = this.current.callback;
	this.current = null;
	this.busy = false;
	this.emit("stop");
	if(callback) {
		callback();
	}
	this.next();
};

Output.prototype.playSound = function(file, callback) {
	this.enqueue({
		type : "sound",
		file : file,
		callback :callback
	});
};

Output.prototype.say = function(text, callback) {
	this.enqueue({
		type : "speech",
		text : text,
		callback :callback
	});
};

Output.prototype.enqueue = function(workitem) {
	this.queue.push(workitem);
	if(!this.busy) {
		this.next();
	}
};

Output.prototype.changeGender = function() {
	this.speech.changeGender();
	this.say("Geschlechtsumwandlung erfolgreich.");
};

module.exports = Output;
