import * as Winston from "winston";
import * as HTTPCodes from "./httpcodes";

/**
 * This handles the /rss endpoint and generates a list of all rss feeds.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const RSS = function(bot) {
	return async function(req, res) {
		const has = await bot.permissions.hasPermission(req.session.user, "rss");
		try {
			const feeds = await bot.database.listRSSFeeds();
			res.locals.feeds = feeds;
		}
		catch(err) {
			Winston.error("Could not retrieve list of feeds.", err);
			res.locals.feeds = [];
		}
		res.locals.canrss = has;
		res.render("rss");
	};
};

export default RSS;
