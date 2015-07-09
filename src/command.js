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
 * @param {string} via - Origin of the command, whether it came via steam,
 * 						 website, minecraft, terminal, mumble, ...
 * @param user - User that issued the command or null if unknown.
 */
Command.prototype.processPrefixed = function(text, via, user) {
	if(text.startsWith(this.bot.hotword)) {
		text = text.substring(this.bot.hotword.length + 1, text.length);
		this.process(text, via, user);
	}
};

/**
 * Processes a command not prefixed with hotword.
 * @param {string} text - Command to execute.
 * @param {string} via - Origin of the command, whether it came via steam,
 * 						 website, minecraft, terminal, mumble, ...
 * @param user - User that issued the command or null if unknown.
 */
Command.prototype.process = function(text, via, user) {
	var found = false;
	for(var key in this.commands) {
		if(key === text.substring(0, key.length)) {
			text = text.substring(key.length + 1, text.length);
			var method = this.commands[key];
			var arguments;
			if(text.length == 0) {
				arguments = [];
			}
			else {
				arguments = text.split(" ");
			}
			if(typeof method === "function") {
				this._logCommand(key, arguments, via, user);
				arguments.unshift(via);
				arguments.unshift(user);
				method.apply(this, arguments);
			}
			found = true;
			break;
		}
	}
	if(!found) {
		this.bot.playSound("sounds/recognition_failure.wav");
	}
};

Command.prototype._logCommand = function(command, arguments, via, user) {
	var username;
	if(user) {
		username = user.username;
	}
	else {
		username = "Unknown user";
	}
	Winston.info("Issued command by user \"" + username +
		"\" via " + via +
		": \"" + command + (arguments.length > 0 ? " " : "") +
		arguments.join(" ") + "\""
	);
};

/**
 * Registers a new command which can then be executed later on.
 * @param {string} name - Name of the command to register.
 * @param command - Command to register with this name.
 * @param {string[]} arguments - (Optional) Array of possible arguments.
 * @param {string} permission - (Optional) Permission needed to execute this command.
 */
Command.prototype.newCommand = function(name, command, arguments, permission) {
	if(permission) {
		this.commands[name] = function(user, via, arg) {
			if(via == 'terminal') {
				command.apply(this, arguments);
			}
			else if(!user) {
				Winston.warn("Unknown user tried to execute command \"" + name + "\" which needs permission \"" + permission + "\".");
			}
			else {
				this.bot.permissions.hasPermission(user, permission, function(hasPermission) {
					if(hasPermission) {
						command.apply(this, arguments);
					}
					else {
						Winston.warn("User \"" + user.username + "\" tried to execute command \"" + name + "\" which needs permission \"" + permission + "\".");
					}
				}.bind(this));
			}
		}.bind(this);
	}
	else {
		this.commands[name] = command;
	}
};

module.exports = Command;
