import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Statistics view for playbacks per user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewOnlinePerUser = function(bot) {
	return async function(req, res) {
		try {
			const spoken = await bot.database.getOnlinePerUser();
			res.status(HTTPCodes.okay).send(spoken);
		}
		catch(err) {
			Winston.error("Could not get amount of online time by user.", err);
			res.status(HTTPCodes.internalError).send(spoken);
		}
	};
};

export default ViewOnlinePerUser;
