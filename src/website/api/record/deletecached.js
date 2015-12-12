import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view handles the deleting of cached records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewDeleteCached = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			if(bot.removeCachedAudioById(req.query.id)) {
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

export default ViewDeleteCached;
