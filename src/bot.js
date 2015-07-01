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
var Readline = require("readline");
var Quotes = require("./quotes");
var FS = require('fs');
/*
 * Code
 */
var Bot = function(mumble, options, database) {
	this.options = options;
	this.mumble = mumble;
	this.database = database;

	this.hotword = options.hotword.replace("%name%", options.name).toLowerCase();
	Winston.info("Hotword is '" + this.hotword + "'");

	this.command = new Command(this);
	this.quotes = new Quotes(this);

	this._inputStream = mumble.inputStream();

	this.website = new Website(this);

	this._initChatInput();
	this._initPromptInput();

	this.output = new Output(this);

	if(options.mpd) {
		this.music = new Music(this);
		this.output.on("start", this.music.mute.bind(this.music));
		this.output.on("stop", this.music.unmute.bind(this.music));
		this.mpd = new MPDControl(this);
	}

	this._loadAddons("addons/", function() {
		//Must be run after all commands were registered
		this._generateGrammar();
		this.input = new Input(this);
		this.input.on('input', function(text, user) {
			text = text.substring(this.bot.hotword.length + 1, text.length);
			this.command.process(text);
		}.bind(this));
	}.bind(this));
};

Bot.prototype._initPromptInput = function() {
	this._rlStdin = Readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
	this._rlStdin.on('line', function(line) {
		this.command.process(line);
	}.bind(this));
};

Bot.prototype._initChatInput = function() {
	this.mumble.on("message", function(message, user, scope) {
        this.command.process(message);
    }.bind(this));
};

Bot.prototype._loadAddons = function(dir, callback) {
	FS.readdir(dir, function(err, files) {
		if(err) {
			Winston.console.error("Error loading addons!");
			throw err;
		}
		else {
			for(var i in files) {
				var filename = dir + "/" + files[i];
				require("../" + filename)(this);
				Winston.info("Loaded addon " + filename + ".");
			}
		}
		callback();
	}.bind(this));
};

Bot.prototype.busy = function() {
	return this.output.busy || this.input.busy;
};

Bot.prototype.playSound = function(filename, cb) {
	this.output.playSound(filename, cb);
};

Bot.prototype.startPipingUser = function(user) {
	//console.log("Piping started");
	if(this.music) {
		this.music.mute();
	}
	this._pipeUserEvent = function(chunk) {
		this._inputStream.write(chunk);
	}.bind(this);
	this._pipeUserStream = user.outputStream(true);
	this._pipeUserStream.on('data', this._pipeUserEvent);
};

Bot.prototype.stopPipingUser = function() {
	//console.log("Piping stopped");
	if(this.music) {
		this.music.unmute();
	}
	this._pipeUserStream.removeListener('data', this._pipeUserEvent);
	this._pipeUserStream = undefined;
	this._pipeUserEvent = undefined;
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
