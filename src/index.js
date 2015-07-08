/*
 * Imports
 */
var Util = require("util");
var Input = require("./input");
var Command = require("./command");
var Output = require("./output");
var Music = require("./music");
var MPDControl = require("./mpdcontrol");
var Winston = require('winston');
var Website = require('./website');
var Readline = require("readline");
var Quotes = require("./quotes");
var FS = require('fs');
var Steam = require('./steam');
var Minecraft = require('./minecraft');
var EventEmitter = require("events").EventEmitter;
var Permissions = require("./permissions");

/*
 * Code
 */

/**
 * This is the constructor of the bot.
 * @constructor
 * @param mumble - already set up mumble connection
 * @param options - Options read from the config.json
 * @param {Database} database - Started connection to database.
 */
var Bot = function(mumble, options, database) {
	this.options = options;
	this.mumble = mumble;
	this.database = database;
	this.commands = [];

	this.hotword = options.hotword.replace("%name%", options.name).toLowerCase();
	Winston.info("Hotword is '" + this.hotword + "'");

	this.command = new Command(this);
	this.quotes = new Quotes(this);
	this.permissions = new Permissions(database);

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

	if(options.steam) {
		this.steam = new Steam(this, options.steam);
	}

	if(options.minecraft) {
		this.minecraft = new Minecraft(options.minecraft, this);
	}

	this._loadAddons("addons/", function() {
		//Must be run after all commands were registered
		this._generateGrammar();
		this.input = new Input(this);
		this.input.on('input', function(text, user) {
			this.command.processPrefixed(text);
		}.bind(this));
	}.bind(this));

	this.mumble.on('user-connect', function(user) {
		this.sayImportant(user.name + " hat Mumble betreten.");
	}.bind(this));
	this.newCommand("help", function() {
		var help = "Hilfe. Du musst mich mit meinem hot Word ansprechen. Mein hot Word ist: '" + this.hotword +
			"'. Um eine Liste aller Kommandos zu erhalten, sag: '" + this.hotword +
			" commands'";
		this.say(help);
	}.bind(this), "Gibt einen Hilfetext aus.", "info");
	this.newCommand("commands", function() {
		var commandsSay = "Ich kenne die folgenden Kommandos ";
		var commandsWrite = "Ich kenne die folgenden Kommandos:<br>";
		for(var key in this.command.commands) {
			commandsSay += key + ",";
			commandsWrite += "  * " + key + "<br>";
		}
		this.say(commandsSay + ". Ich habe diese Liste auch in den Chat geschrieben.");
		this.mumble.user.channel.sendMessage(commandsWrite.substring(0, commandsWrite.length - 4));
	}.bind(this), "Gibt eine Liste aller Kommandos aus.", "list-ul");
	this.newCommand("shutdown", this.shutdown.bind(this), "Fährt den bot herunter.", "power-off");
};

Util.inherits(Bot, EventEmitter);

/**
 * Gently shutdown the whole bot.
 */
Bot.prototype.shutdown = function() {
	this.say("Herunterfahren initiiert.", function() {
		this.website.shutdown(function() {
			if(this.steam) {
				this.steam.stop();
			}
			if(this.minecraft) {
				this.minecraft.stop();
			}
			if(this.mpd) {
				this.mpd.stop();
				this.music.stop();
			}
			this.emit("shutdown");
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
				var filename = dir + files[i];
				if(FS.lstatSync(filename).isDirectory()) {
					require("../" + filename)(this);
					Winston.info("Loaded addon " + filename + ".");
				}
			}
		}
		callback();
	}.bind(this));
};

/**
 * Will return whether the bot is busy speaking or listening to anyone.
 * @return If the bot is busy speaking or listening
 */
Bot.prototype.busy = function() {
	return this.output.busy || this.input.busy;
};

/**
 * Plays a sound in the mumble server.
 * @param {string} filename - Filename of the soundfile to play. Must be a mono-channel 48,000Hz WAV-File
 * @param cb - Callback will be called when sound has finished playing
 */
Bot.prototype.playSound = function(filename, cb) {
	this.output.playSound(filename, cb);
};

/**
 * Will start echoing everything a user says.
 * This method is used so that anyone can hear which voice-command
 * is currently given to the bot and not just the bleeep and bloop sounds.
 * @param user - mumble user to start piping.
 */
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

/**
 * Stop echoing the user which is currently being echoed.
 */
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

/**
 * This is one of the most important methods in the bot.
 * This will define a new command in the bot. Pleas note that all commands have
 * to be defined before the bot has finished starting up (e.g. as addon or
 * defined in the constructor), as the grammar for the speech recognition has to
 * be generated and will not work otherwise.
 * @param {string} commandName - Name of the command to create
 * @param method - Method which will be called when the command was called
 * @param {string} description - Description of the command as displayed on the website
 * @param {string} icon - [Name of a Fontawesome-icon to display.](http://fortawesome.github.io/Font-Awesome/icons/)
 */
Bot.prototype.newCommand = function(commandName, method, description, icon) {
	this.command.newCommand(commandName, method);
	this.commands.push({
		name : commandName,
		description : description,
		icon : icon
	});
};

/**
 * Makes the bot join a specific channel in mumble.
 * @param cname - Name of the channel to join.
 */
Bot.prototype.join = function(cname) {
	var channel = this.mumble.channelByName(cname);
	channel.join();
};

/**
 * Will say something. The text will be played in mumble using TTS, written to
 * the bots current channel (theoretically) and written in minecraft.
 * @param {string} text - Text to say.
 * @param cb - Callback, will be called *after playback of TTS has finished*.
 */
Bot.prototype.say = function(text, cb) {
	if(this.minecraft) {
		this.minecraft.say(text);
	}
	return this.output.say(text, cb);
};

/**
 * Say something important. Other than the normal say method this will also say
 * the shit in steam.
 * @param {string} text - Text to say.
 * @param cb - Callback, will be called *after playback of TTS has finished*.
 */
Bot.prototype.sayImportant = function(text, cb) {
	if(this.steam) {
		this.steam.broadcast(text);
	}
	return this.say(text, cb);
};

/**
 * Report an error by saying it.
 * @param {string} text - Message of the error to report.
 */
Bot.prototype.sayError = function(text) {
	return this.output.say("Fehler:    " + text);
};

/**
 * Find all users in mumble which contain the supplied string in their name.
 * For example: ```bot.findUsers("merlin");``` will find "Merlin | LÖML | Mörrrlin".
 * This method is used in *certain* methods.
 * @param {string} namePart - Text to search for.
 */
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
