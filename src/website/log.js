import * as Winston from "winston";
import * as HTTPCodes from "./httpcodes";
/**
 * This handles the /log endpoint with the list of the latest log entries when the needed permission is given.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const Log = function(bot) {
	return function(req, res) {
		bot.database.listLog((err, entries) => {
			if(err) {
				Winston.error("Unabled to fetch logentries from database.", err);
				entries = [];
			}
			bot.permissions.hasPermission(req.session.user, "log", (has) => {
				if(has) {
					res.locals.log = entries;
					res.render("log");
				}
				else {
					res.status(HTTPCodes.forbidden).send("Forbidden.");
				}
			});
		});
	};
};

export default Log;
