var Winston = require("winston");

/**
 * <b>/quotes/add/</b> Enables the user to add a new quote.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewQuotesAdd = function(bot) {
	return function(req, res) {
		bot.quotes.count(function(err, count) {
			if(err) {
				Winston.error("Error fetching amount of quotes: " + err);
				res.locals.quoteAmount = 0;
			}
			else {
				res.locals.quoteAmount = count;
			}
			res.render("quotes/add");
		});
	}
};

module.exports = ViewQuotesAdd;
