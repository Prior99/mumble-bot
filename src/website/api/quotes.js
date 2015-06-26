function enterQuote(author, quote, bot, res) {
	bot.database.addQuote(author, quote, function(err, id) {
		if(err) {
			Winston.error("Error occured when entering quote into database: " + err);
			res.send(JSON.stringify({
				okay : false,
				reason : "internal_error"
			}));
		}
		else {
			res.send(JSON.stringify({
				okay : true,
				id : id
			}));
		}
	});
}

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.author && req.query.quote) {
			enterQuote(req.query.author, req.query.quote, bot, res)
		}
		else {
			res.send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};
