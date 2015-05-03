/*
 * Imports
 */
var VoiceInput = require("./voice_input");
var Command = require("./command");
var VoiceOutput = require("./voice_output");
/*
 * Code
 */
var Bot = function(mumble, options) {
	this.options = options;
	this.mumble = mumble;
	this.voiceInput = new VoiceInput(this);
	this.voiceOutput = new VoiceOutput(mumble);
	this.command = new Command(this);
	this.voiceInput.on('input', function(text, score) {
		this.command.process(text);
	}.bind(this));
};

Bot.prototype.join = function(cname) {
	var channel = this.mumble.channelByName(cname);
	channel.join();
};

Bot.prototype.say = function(text) {
	return this.voiceOutput.say(text);
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
