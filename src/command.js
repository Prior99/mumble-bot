/*
 * Imports
 */
var Winston = require('winston');

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

/**
 * Processes the bots commands. As defined by modules and extensions.
 * @constructor
 * @param {Bot} bot - Bot this instance belongs to.
 */
var Command = function(bot) {
	this.bot = bot;
	this.commands = [];
	Winston.info("Module started: Command");
};

/**
 * Process a command prefixed with the hotword.
 * @param {string} text - Command to execute.
 */
Command.prototype.processPrefixed = function(text) {
	if(text.startsWith(this.bot.hotword)) {
		text = text.substring(this.bot.hotword.length + 1, text.length);
		this.process(text);
	}
};

/**
 * Processes a command not prefixed with hotword.
 * @param {string} text - Command to execute.
 */
Command.prototype.process = function(text) {
	var found = false;
	for(var key in this.commands) {
		if(key === text.substring(0, key.length)) {
			text = text.substring(key.length + 1, text.length);
			var method = this.commands[key];
			var commands = text.split(" ");
			if(typeof method === "function") {
				method.apply(this, commands);
			}
			found = true;
			break;
		}
	}
	if(!found) {
		this.bot.playSound("sounds/recognition_failure.wav");
	}
};

/**
 * Registers a new command which can then be executed later on.
 * @param {string} name - Name of the command to register.
 * @param command - Command to register with this name.
 */
Command.prototype.newCommand = function(name, command) {
	this.commands[name] = command;
};

module.exports = Command;
