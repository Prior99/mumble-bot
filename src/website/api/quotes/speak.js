module.exports = function(bot) {
	return function(req, res) {
		bot.quotes.speak(req.query.id);
		res.send(JSON.stringify({
			okay : true
		}));
	}
};
