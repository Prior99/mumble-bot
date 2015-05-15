/*
 * Imports
 */
var Input = require("./input/input");
var Command = require("./command");
var Output = require("./output/output");
var Music = require("./music");
var MPDControl = require("./mpdcontrol");
var Winston = require('winston');
var Website = require('./website/website');
var FS = require('fs');
/*
 * Code
 */
var Bot = function(mumble, options) {
	this.options = options;
		this.mumble = mumble;

	this.hotword = options.hotword.replace("%name%", options.name).toLowerCase();
	Winston.info("Hotword is '" + this.hotword + "'");

	this.command = new Command(this);
	this.output = new Output(this);

	if(options.mpd) {
		this.music = new Music(this);
		this.output.on("start", this.music.mute.bind(this.music));
		this.output.on("stop", this.music.unmute.bind(this.music));
		this.mpd = new MPDControl(this);
	}

	require('./fun')(this);
	require('./diagnostic')(this);

	this.newCommand("get out", function() {
		this.say("Aber ich liebe dich");
		this.output.once('speak-stop', function() {
			this.join(this.options.afkChannel);
		}.bind(this));
	}.bind(this));

	this.website = new Website(this);

	//Must be run after all commands were registered
	this._generateGrammar();
	this.input = new Input(this);
	this.input.on('input', function(text, user) {
		this.command.process(text);
	}.bind(this));
};

Bot.prototype.busy = function() {
	return this.output.busy || this.input.busy;
};

Bot.prototype.playSound = function(filename, user, cb) {
	this.output.playSound(filename, user, cb);
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
	return this.output.say(text, cb);
};

Bot.prototype.sayError = function(text) {
	return this.output.say("Fehler:    " + text);
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
