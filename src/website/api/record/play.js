import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view is responsible for playing back a stored record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlay = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			bot.database.usedRecord(req.query.id, (err) => {
				if(err) {
					Winston.error("Could not increase usages of record", err);
					res.status(HTTPCodes.internalError).send({
						okay: false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log("verbose", req.session.user.username + " played back record #" + req.query.id);
					bot.playSound("sounds/recorded/" + req.query.id);
					res.status(HTTPCodes.okay).send({
						okay : true
					});
				}
			});
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
