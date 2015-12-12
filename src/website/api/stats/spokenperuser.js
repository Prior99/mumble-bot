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
	return function(req, res) {
		Promise.denodeify(bot.database.getSpokenPerUser.bind(bot.database))()
		.catch((err) =>{
			Winston.error("Could not get amount of speech by user.", err);
			return [];
		})
		.then((spoken) => res.status(HTTPCodes.okay).send(spoken));
	};
};

export default ViewSpokenPerUser;
