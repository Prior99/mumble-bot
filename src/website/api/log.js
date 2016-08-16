import * as Winston from "winston";
import HTTPCodes from "./httpcodes";
/**
 * This handles the /log endpoint with the list of the latest log entries when the needed permission is given.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const Log = function(bot) {
	return async function(req, res) {
		try {
			const has = await bot.permissions.hasPermission(req.session.user, "log");
			const entries = await bot.database.listLog();
			if(has) {
				res.send({
					okay: true,
					entries
				});
			}
			else {
				res.send({
					okay: false,
					reason: "insufficient_permission"
				});
			}
		}
		catch(err) {
			Winston.error("Unabled to fetch logentries from database.", err);
			res.status(HTTPCodes.internalError).send(JSON.stringify({
				okay : false
			}));
		}
	};
};

export default Log;
