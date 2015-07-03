module.exports = function(bot) {
	bot.newCommand("tell us a story", function() {
		bot.say("One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.");
	}, "Lässt den Bot zu Diagnosezwecken eine Geschichte erzählen.", "book");
};
