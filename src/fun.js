module.exports = function(bot) {

	bot.newCommand("kick merlin", function() {
		var merlins = bot.findUsers("Moerrrlin");
		if(merlins.length === 0) {
			bot.say("Hmmm. I can not find him. Maybe he is hiding?");
		}
		else {
			bot.say("Merlin get the fuck out.");
			bot.output.once('speak-stop', function() {
				merlins[0].moveToChannel(bot.options.kickChannel);
			});
		}
	});

	bot.newCommand("kick everyone", function() {
		bot.say("Get the fuck out.");
		var channel = bot.mumble.user.channel;
		bot.output.once('speak-stop', function() {
			for(var key in channel.users) {
				var user = channel.users[key];
				if(user !== bot.mumble.user) {
					user.moveToChannel(bot.options.kickChannel);
				}
			}
		});
	});
};
