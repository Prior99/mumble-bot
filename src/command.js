/*
 * Imports
 */
var Command = function(bot) {
	this.bot = bot;
};
/*
 * Defines
 */
var HOT_WORD = "okay jenny";
/*
 * Code
 */
Command.prototype.process = function(text) {
	text = text.substring(HOT_WORD.length + 1, text.length);
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
		this.bot.say("Unknown command: " + text);
	}
};

Command.prototype.commands = [];

Command.prototype.commands["get out"] = function() {
	this.bot.say("But    I love you");
	setTimeout(function() {
		this.bot.join(this.bot.options.afkChannel);
	}.bind(this), 1000);
};

module.exports = Command;
