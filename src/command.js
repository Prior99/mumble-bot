/*
 * Imports
 */
import Winston from "winston";

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
 */
class Command {
	/**
	 * @constructor
	 * @param {Bot} bot - Bot this instance belongs to.
	 */
	constructor(bot) {
		this.bot = bot;
		this.commands = [];
		Winston.info("Module started: Command");
	}

	/**
	 * Process a command prefixed with the hotword.
	 * @param {string} text - Command to execute.
	 * @param {string} via - Origin of the command, whether it came via steam,
	 * 						 website, minecraft, terminal, mumble, ...
	 * @param {DatabaseUser} user - User that issued the command or null if unknown.
	 * @returns {undefined}
	 */
	processPrefixed(text, via, user) {
		if(text.startsWith(this.bot.hotword)) {
			text = text.substring(this.bot.hotword.length + 1, text.length);
			this.process(text, via, user);
		}
	}

	/**
	 * Processes a command not prefixed with hotword.
	 * @param {string} text - Command to execute.
	 * @param {string} via - Origin of the command, whether it came via steam,
	 * 						 website, minecraft, terminal, mumble, ...
	 * @param {DatabaseUser} user - User that issued the command or null if unknown.
	 * @returns {undefined}
	 */
	process(text, via, user) {
		let found = false;
		for(const key in this.commands) {
			if(this.commands.hasOwnProperty(key)) {
				if(key === text.substring(0, key.length)) {
					text = text.substring(key.length + 1, text.length);
					const method = this.commands[key];
					let args = [];
					if(text.length >= 0) {
						args = text.split(" ");
						args = args.filter((arg) => arg !== "");
					}
					if(typeof method === "function") {
						this._logCommand(key, args, via, user);
						args.unshift(via);
						args.unshift(user);
						try {
							method(...args);
						}
						catch(err) {
							Winston.error("Error executing command \"" + key + "\":", err);
						}
					}
					found = true;
					break;
				}
			}
		}
		if(!found) {
			this.bot.playSound("sounds/recognition_failure.wav");
		}
	}

	/**
	 * Logs a command execution.
	 * @param {Command} command - The issued command.
	 * @param {string[]} args - The command's arguments.
	 * @param {string} via - Origin of the command, whether it came via steam,
	 * 						 website, minecraft, terminal, mumble, ...
	 * @param {DatabaseUser} user - User that issued the command or null if unknown.
	 * @returns {undefined}
	 */
	_logCommand(command, args, via, user) {
		let username;
		if(user) {
			username = user.username;
		}
		else {
			username = "Unknown user";
		}
		Winston.info("Issued command by user \"" + username +
			"\" via " + via +
			": \"" + command + "\" " + (args.length > 0 ? "\"" + args.join(" ") + "\"" : "")
		);
	}

	/**
	 * Registers a new command which can then be executed later on.
	 * @param {string} name - Name of the command to register.
	 * @param {Command} command - Command to register with this name.
	 * @param {string[]} args - (Optional) Array of possible arguments.
	 * @param {string} permission - (Optional) Permission needed to execute this command.
	 * @returns {undefined}
	 */
	newCommand(name, command, args, permission) {
		if(permission) {
			this.commands[name] = async function(user, via, arg) {
				if(via === "terminal") {
					command.apply(this, args);
				}
				else if(!user) {
					Winston.warn("Unknown user tried to execute command \"" + name
						+ "\" which needs permission \"" + permission + "\".");
				}
				else {
					const hasPermission = await this.bot.permissions.hasPermission(user, permission);
					if(hasPermission) {
						command(...arguments);
					}
					else {
						Winston.warn("User \"" + user.username + "\" tried to execute command \"" + name
							+ "\" which needs permission \"" + permission + "\".");
					}
				}
			}.bind(this);
		}
		else {
			this.commands[name] = command;
		}
	}
}

module.exports = Command;
