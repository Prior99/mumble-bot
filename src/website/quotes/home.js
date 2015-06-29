var Winston = require("winston");

module.exports = function(bot) {
	return function(req, res) {
		bot.database.getQuoteCount(function(err, count) {
			if(err) {
				Winston.error("Error fetching amount of quotes: " + err);
				res.locals.quoteAmount = 0;
			}
			else {
				res.locals.quoteAmount = count;
			}
			res.render("quotes/home");
		});
	}
};
