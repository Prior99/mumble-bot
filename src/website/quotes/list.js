var Winston = require("winston");

/**
 * <b>/quotes/list/</b> Displays a list of quotes.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewQuotesList= function(bot) {
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

module.exports = ViewQuotesList;
