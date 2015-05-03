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
		this.bot.sayError("Unknown command: " + text);
	}
};

Command.prototype.commands = [];

Command.prototype.commands["get out"] = function() {
	this.bot.say("But    I love you");
	setTimeout(function() {
		this.bot.join(this.bot.options.afkChannel);
	}.bind(this), 1000);
};

Command.prototype.commands["kick merlin"] = function() {
	var merlins = this.bot.findUsers("Moerrrlin");
	if(merlins.length === 0) {
		this.bot.say("Hmmm. I can not find him. Maybe he is hiding?");
	}
	else {
		this.bot.say("Merlin get the fuck out.");
		setTimeout(function() {
			merlins[0].moveToChannel(this.bot.options.kickChannel);
		}.bind(this), 2000);
	}
};

Command.prototype.commands["kick everyone"] = function() {
	this.bot.say("Get the fuck out.");
	var channel = this.bot.mumble.user.channel;
	setTimeout(function() {
		for(var key in channel.users) {
			var user = channel.users[key];
			if(user !== this.bot.mumble.user) {
				user.moveToChannel(this.bot.options.kickChannel);
			}
		}
	}.bind(this), 1000);
};

Command.prototype.commands["music stop"] = function() {
	if(this.bot.options.mpd) {
		this.bot.mpd.pause();
	}
	else {
		this.bot.sayError("I was not configured to play back music.");
	}
};

Command.prototype.commands["music start"] = function() {
	if(this.bot.options.mpd) {
		this.bot.mpd.play();
	}
	else {
		this.bot.sayError("I was not configured to play back music.");
	}
};

Command.prototype.commands["tell us a story"] = function() {
	this.bot.say("One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.");
};

Command.prototype.commands["change gender"] = function() {
	this.bot.voiceOutput.changeGender();
};

module.exports = Command;
