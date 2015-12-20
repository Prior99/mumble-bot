import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Statistics view for playbacks per user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRecordPlaybacksPerUser = function(bot) {
	return async function(req, res) {
		try {
			const spoken = await bot.database.getRecordPlaybackCountPerUser();
			res.status(HTTPCodes.okay).send(spoken);
		}
		catch(err) {
			Winston.error("Could not get playbacks of records by user.", err);
			res.status(HTTPCodes.internalError).send([]);
		}
	};
};
export default ViewRecordPlaybacksPerUser;
