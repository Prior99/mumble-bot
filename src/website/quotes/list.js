import * as Winston from "winston";

/**
 * <b>/quotes/list/</b> Displays a list of quotes.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewQuotesList= function(bot) {
	return async function(req, res) {
		try {
			const list = await bot.quotes.list();
			const maxTextLength = 50;
			for(const k of list) {
				if(k.quote.length > maxTextLength) {
					k.quote = k.quote.substring(0, maxTextLength - 3) + "...";
				}
			}
			res.locals.quotes = list;
		}
		catch(err) {
			Winston.error("Error fetching amount of quotes: " + err);
			res.locals.quotes = [];
		}
		res.render("quotes/list");
	}
};

export default ViewQuotesList;
