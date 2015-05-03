/*
 * Imports
 */
var VoiceInput = require("./voice_input");
var Command = require("./command");
var VoiceOutput = require("./voice_output");
var Music = require("./music");
var MPDControl = require("./mpdcontrol");
/*
 * Code
 */
var Bot = function(mumble, options) {
	this.options = options;
	this.mumble = mumble;
	this.command = new Command(this);
	this.voiceInput = new VoiceInput(this);
	this.voiceOutput = new VoiceOutput(this);
	this.voiceInput.on('input', function(text, score) {
		this.command.process(text);
	}.bind(this));
	if(options.mpd) {
		this.music = new Music(this);
		this.mpd = new MPDControl(this);
	}
	require('./fun')(this);
	require('./diagnostic')(this);

	this.newCommand("get out", function() {
		this.say("But    I love you");
		this.voiceOutput.once('speak-stop', function() {
			this.join(this.options.afkChannel);
		}.bind(this));
	}.bind(this));
};

Bot.prototype.newCommand = function(commandName, method) {
	this.command.newCommand(commandName, method);
};

Bot.prototype.join = function(cname) {
	var channel = this.mumble.channelByName(cname);
	channel.join();
};

Bot.prototype.say = function(text) {
	return this.voiceOutput.say(text);
};

Bot.prototype.sayError = function(text) {
	return this.voiceOutput.say("Exception:    " + text);
};

Bot.prototype.findUsers = function(namePart) {
	namePart = namePart.toLowerCase();
	var users = this.mumble.users();
	var found = [];
	for(var key in users) {
		var user = users[key];
		if(user.name.toLowerCase().indexOf(namePart) !== -1) {
			found.push(user);
		}
	}
	return found;
}

module.exports = Bot;
