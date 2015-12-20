import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Remove an RSS feed.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRemove = function(bot) {
	return async function(req, res) {
		const has = await bot.permissions.hasPermission(req.session.user, "rss");
		if(req.query.id) {
			if(has) {
				try {
					await bot.database.removeRSSFeed(req.query.id);
					Winston.verbose(req.session.user.username + " removed rss-feed with id " + req.query.id);
					res.status(HTTPCodes.okay).send({
						okay : true
					});
				}
				catch(err) {
					Winston.error("Could not remove new RSS feed.", err);
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

export default ViewRemove;
