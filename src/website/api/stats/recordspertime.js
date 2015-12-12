import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view displays the statistics for the records per time endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRecordsPerTime = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getRecordCountByDays.bind(bot.database))()
		.catch((err) => {
			Winston.error("Could not get record count by days.", err);
			return [];
		})
		.then((spoken) => res.status(HTTPCodes.okay).send(spoken));
	};
};

export default ViewRecordsPerTime;
