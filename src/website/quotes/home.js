import * as Winston from "winston";

/**
 * <b>/quotes/</b> Displays the home page for the /quotes/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewQuotesHome = function(bot) {
	return function(req, res) {
		bot.quotes.count((err, count) => {
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
export default ViewQuotesHome;
