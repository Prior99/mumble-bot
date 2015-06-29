var Winston = require("winston");

module.exports = function(bot) {
	return function(req, res) {
		bot.quotes.list(function(err, list) {
			if(err) {
				Winston.error("Error fetching amount of quotes: " + err);
				res.locals.quotes = [];
			}
			else {
				res.locals.quotes = list;
			}
			res.render("quotes/list");
		});
	}
};
