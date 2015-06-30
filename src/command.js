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
		var help = "Hilfe. Du musst mich mit meinem hot Word ansprechen. Mein hot Word ist: '" + bot.hotword + "'. Um eine Liste aller Kommandos zu erhalten, sag: '" + bot.hotword + " commands'";
		bot.say(help);
	});
	this.newCommand("commands", function() {
		var commandsSay = "Ich kenne die folgenden Kommandos ";
		var commandsWrite = "Ich kenne die folgenden Kommandos:<br>";
		for(var key in this.commands) {
			commandsSay += key + ",";
			commandsWrite += "  * " + key + "<br>";
		}
		bot.say(commandsSay + ". Ich habe diese Liste auch in den Chat geschrieben.");
		bot.mumble.user.channel.sendMessage(commandsWrite.substring(0, commandsWrite.length - 4));
	});
	Winston.info("Module started: Command");
};

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

Command.prototype.newCommand = function(name, method) {
	this.commands[name] = method;
};

module.exports = Command;
