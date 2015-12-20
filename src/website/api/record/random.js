import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * View for playing back a random record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRandomPlayback = function(bot) {
	return async function(req, res) {
		try {
			const record = await bot.database.getRandomRecord();
			try {
				await bot.database.usedRecord(record.id);
				Winston.log("verbose", req.session.user.username + " played back random record  with id #" + record.id);
				bot.playSound("sounds/recorded/" + record.id);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				Winston.error("Could not increase usage of record", err);
				res.status(HTTPCodes.internalError).send({
					okay: false,
					reason : "internal_error"
				});
			}
		}
		catch(err) {
			Winston.error("Could not fetch random record", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason : "internal_error"
			});
		}
	};
};

export default ViewRandomPlayback;
