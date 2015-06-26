function enterQuote(author, quote, bot) {
	bot.database.enterQuote(author, quote, function(err, id) {
		if(err) {
			Winston.error("Error occured when entering quote into database: " + err);
			return {
				okay : false,
				reason : "internal_error"
			};
		}
		else {
			return {
				okay : true,
				id : id
			};
		}
	});
}

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.author && req.query.quote) {
			res.send(JSON.stringify(enterQuote(req.query.author, req.query.quote, bot)));
		}
		else {
			res.send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};
