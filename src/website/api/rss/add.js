import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Add an RSS feed.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAdd = function(bot) {
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, "rss", (has) => {
			if(req.query.url && req.query.name) {
				if(has) {
					bot.rss.markAllArticlesAsKnown(req.query.url);
					bot.database.addRSSFeed(req.query.url, req.query.name, (err) => {
						if(err) {
							Winston.error("Could not add new RSS feed.", err);
							res.status(HTTPCodes.internalError).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							Winston.verbose(req.session.user.username + " added an rss-feed: " + req.query.url);
							res.status(HTTPCodes.okay).send({
								okay : true
							});
						}
					});
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
		});
	};
};

export default ViewAdd;
