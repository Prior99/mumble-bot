import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Add an RSS feed.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAdd = function(bot) {
	return async function(req, res) {
		const has = await bot.permissions.hasPermission(req.session.user, "rss");
		if(req.query.url && req.query.name) {
			if(has) {
				bot.rss.markAllArticlesAsKnown(req.query.url);
				try {
					await bot.database.addRSSFeed(req.query.url, req.query.name);
					Winston.verbose(req.session.user.username + " added an rss-feed: " + req.query.url);
					res.status(HTTPCodes.okay).send({
						okay : true
					});
				}
				catch(err) {
					Winston.error("Could not add new RSS feed.", err);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
				}
			}
			else {
				res.status(HTTPCodes.insufficientPermission).send({
					okay : false,
					reason : "permission_denied"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewAdd;
