/*
 * Imports
 */
var VoiceInput = require("./voice_input");
var Command = require("./command");
var VoiceOutput = require("./voice_output");
var Music = require("./music");
var MPDControl = require("./mpdcontrol");
var Winston = require('winston');
var FS = require('fs');
/*
 * Code
 */
var Bot = function(mumble, options) {
	this.options = options;
	this.hotword = options.hotword.replace("%name%", options.name).toLowerCase();
	Winston.info("Hotword is '" + this.hotword + "'");
	this.mumble = mumble;
	this.command = new Command(this);
	this.voiceOutput = new VoiceOutput(this);
	if(options.mpd) {
		this.music = new Music(this);
		this.mpd = new MPDControl(this);
	}
	require('./fun')(this);
	require('./diagnostic')(this);

	this.newCommand("get out", function() {
		this.say("Aber ich liebe dich");
		this.voiceOutput.once('speak-stop', function() {
			this.join(this.options.afkChannel);
		}.bind(this));
	}.bind(this));

	this.newCommand("", function() {
		this.say("Was willst du?");
	}.bind(this));

	//Must be run after all commands were registered
	this._generateGrammar();
	this.voiceInput = new VoiceInput(this);
	this.voiceInput.on('input', function(text, score) {
		this.command.process(text);
	}.bind(this));
};

Bot.prototype.playSound = function(filename, user, cb) {
	this.voiceOutput.playSound(filename, user, cb);
};

Bot.prototype._generateGrammar = function() {
	var grammar = "#JSGF V1.0;\n";
	grammar += "\n";
	grammar += "/*\n";
	grammar += " * This is an automatic generated file. Do not edit.\n";
	grammar += " * Changes will be overwritten on next start of bot.\n";
	grammar += " */\n";
	grammar += "\n";
	grammar += "grammar commands;\n";
	grammar += "\n";
	grammar += "<hotword> = " + this.hotword.toLowerCase() + ";\n";
	grammar += "\n";
	var commandLine = "<command> =";
	for(var key in this.command.commands) {
		if(key === "") {
			continue;
		}
		Winston.info("Command: '" + key + "'");
		var tag = "_" + key.replace(" ", "").toLowerCase();
		grammar += "<" + tag + "> = " + key.toLowerCase() + ";\n"
		commandLine += " <" + tag + "> |";
	}
	grammar += "\n";
	grammar += commandLine.substring(0, commandLine.length - 2) + ";\n";
	grammar += "\n";
	grammar += "public <commands> = <hotword> <command>;";
	FS.writeFileSync("commands.gram", grammar);
};

Bot.prototype.newCommand = function(commandName, method) {
	this.command.newCommand(commandName, method);
};

Bot.prototype.join = function(cname) {
	var channel = this.mumble.channelByName(cname);
	channel.join();
};

Bot.prototype.say = function(text, cb) {
	return this.voiceOutput.say(text, cb);
};

Bot.prototype.sayError = function(text) {
	return this.voiceOutput.say("Fehler:    " + text);
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
