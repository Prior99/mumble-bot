import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * This view handles the deleting of cached records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const DeleteCached = function(bot) {
	return function(req, res) {
		if(req.body.id) {
			if(bot.removeCachedAudioById(req.body.id)) {
				res.status(HTTPCodes.okay).send(true);
			}
			else {
				res.status(HTTPCodes.internalError).send({
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				reason : "missing_arguments"
			});
		}
	};
};

export default DeleteCached;
