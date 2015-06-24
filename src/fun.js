var Request = require("request");
var Merlin = require("./moerrrlin.json");

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

	bot.newCommand("teach", function() {
		var url = "https://de.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&generator=random&grnnamespace=0";
		Request({
			url: url,
			json: true
		}, function (error, response, body) {
			if(!error && response.statusCode === 200) {
				for(var i in body.query.pages) {
					var elem = body.query.pages[i];
					bot.say("Heute lernen wir etwas über: \"" + elem.title + "\": " + elem.extract + ".");
					return;
				}
			}
		});
	});

	bot.newCommand("quote", function() {
		var number = parseInt(Math.random() * 4740)
		var url = "http://www.zitate-aphorismen.de/rest/quote/" + number;
		Request({
			url: url,
			json: true
		}, function (error, response, body) {
			if(!error && response.statusCode === 200) {
				var quote = body.quote[number];
				bot.say(quote.author + " hat gesagt: " + quote.quote);
			}
		});
	});

	bot.newCommand("merlin", function() {
		var quote = Merlin[Math.floor(Math.random() * Merlin.length)];
		bot.say("Merlin hat gesagt: " + quote);
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
