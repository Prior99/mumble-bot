/*
 * Imports
 */
var Winston = require('winston');
/*
 * Defines
 */
/*
 * Code
 */
var Command = function(bot) {
	this.bot = bot;
	this.commands = [];
	this.newCommand("help", function() {
		var help = "Help! You will have to call me by my hot word. My hot word is '" + bot.hotword + "'. To get a list of all commands I know, say: '" + bot.hotword + " commands'";
		bot.say(help);
	});
	this.newCommand("commands", function() {
		var commandsSay = "I know the following commands ";
		var commandsWrite = "I know the following commands:<br>";
		for(var key in this.commands) {
			commandsSay += key + ",";
			commandsWrite += "  * " + key + "<br>";
		}
		bot.say(commandsSay + ". I also wrote this list to the channels chat.");
		bot.mumble.user.channel.sendMessage(commandsWrite.substring(0, commandsWrite.length - 4));
	});
	Winston.info("Module started: Command");
};

Command.prototype.process = function(text) {
	text = text.substring(this.bot.hotword.length + 1, text.length);
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
		this.bot.sayError("Unknown command: " + text);
	}
};

Command.prototype.newCommand = function(name, method) {
	this.commands[name] = method;
};

module.exports = Command;
