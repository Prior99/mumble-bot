import * as Winston from "winston";

/**
 * <b>/quotes/</b> Displays the home page for the /quotes/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewQuotesHome = function(bot) {
	return async function(req, res) {
		try {
			const count = await bot.quotes.count();
			res.locals.quoteAmount = count;
		}
		catch(err) {
			Winston.error("Error fetching amount of quotes: " + err);
			res.locals.quoteAmount = 0;
		}
		res.render("quotes/home");
	}
};
export default ViewQuotesHome;
