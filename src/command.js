/*
 * Imports
 */
/*
 * Defines
 */
/*
 * Code
 */
var Command = function(bot) {
	this.bot = bot;
	this.commands = [];
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
