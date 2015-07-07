var Winston = require("winston");

/**
 * <b>/quotes/</b> Displays the home page for the /quotes/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewQuotesHome = function(bot) {
	return function(req, res) {
		bot.quotes.count(function(err, count) {
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
module.exports = ViewQuotesHome;
