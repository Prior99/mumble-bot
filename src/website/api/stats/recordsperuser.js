import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

/**
 * API endpoint for statistics about speech per hour.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRecordsPerUser = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getRecordCountByUsers.bind(bot.database))()
		.catch((err) => {
			Winston.error("Could not get record count by users.", err);
			return [];
		})
		.then((arr) => res.status(HTTPCodes.okay).send(arr));
	};
};

export default ViewRecordsPerUser;
