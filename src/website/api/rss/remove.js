import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Remove an RSS feed.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRemove = function(bot) {
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, "rss", (has) => {
			if(req.query.id) {
				if(has) {
					bot.database.removeRSSFeed(req.query.id, (err) => {
						if(err) {
							Winston.error("Could not remove new RSS feed.", err);
							res.status(HTTPCodes.internalError).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							Winston.verbose(req.session.user.username + " removed rss-feed with id " + req.query.id);
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

export default ViewRemove;
