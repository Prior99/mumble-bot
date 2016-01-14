import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * This view is responsible for playing back a stored record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlay = function(bot) {
	return async function(req, res) {
		if(req.query.id) {
			try {
				const details = await bot.database.getRecord(req.query.id);
				await bot.database.usedRecord(req.query.id);
				Winston.log("verbose", req.session.user.username + " played back record #" + req.query.id);
				bot.playSound("sounds/recorded/" + req.query.id, {
					type : "record",
					details,
					user : req.session.user
				});
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				Winston.error("Could not increase usages of record", err);
				res.status(HTTPCodes.internalError).send({
					okay: false,
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			})
		}
	};
};
export default ViewPlay;
