var Request = require("request");

module.exports = function(bot) {

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
		bot.say("Bitte warten.");
	}, "Liest die Zusammenfassung eines zufälligen Wikipedia-Artikels vor.", "question");

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
		bot.say("Bitte warten.");
	}, "Liest ein zufälliges Zitat einer Berühmtheit vor.", "graduation-cap");
};