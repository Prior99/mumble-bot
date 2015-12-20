import * as Winston from "winston";
import * as Promise from "promise";
import HTTPCodes from "../../httpcodes";

/**
 * API endpoint for statistics about speech per hour.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSpokenPerHour = function(bot) {
	return async function(req, res) {
		try {
			const arr = await bot.database.getSpokenPerHour();
			res.status(HTTPCodes.okay).send(arr);
		}
		catch(err) {
			Winston.error("Could not get amount of speech by hour of the day.", err);
			res.status(HTTPCodes.internalError).send([]);
		}
	};
};

export default ViewSpokenPerHour;
