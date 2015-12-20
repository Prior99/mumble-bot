import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

/**
 * API endpoint for statistics about speech per user.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSpokenPerUser = function(bot) {
	return async function(req, res) {
		try {
			const spoken = await bot.database.getSpokenPerUser();
			res.status(HTTPCodes.okay).send(spoken);
		}
		catch(err) {
			Winston.error("Could not get amount of speech by user.", err);
			res.status(HTTPCodes.internalError).send([]);
		}
	};
};

export default ViewSpokenPerUser;
