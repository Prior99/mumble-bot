import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

/**
 * Statistics view for playbacks per user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewOnlinePerUser = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getOnlinePerUser.bind(bot.database))()
		.catch((err) => {
			Winston.error("Could not get amount of online time by user.", err);
			return [];
		})
		.then((spoken) => res.status(HTTPCodes.okay).send(spoken));
	};
};

export default ViewOnlinePerUser;
