import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for portecting a cached record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewProtectCachedRecord = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			if(bot.protectCachedAudio(req.query.id)) {
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			else {
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewProtectCachedRecord;
