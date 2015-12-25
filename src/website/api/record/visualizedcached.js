import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";
import * as FS from "fs";

/**
 * View for the visualization of a cached audio
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewVisualizedCached = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			const sound = bot.getCachedAudioById(+req.query.id);
			if(sound) {
				res.status(HTTPCodes.okay);
				FS.createReadStream(sound.file + ".png").pipe(res);
			}
			else {
				res.status(HTTPCodes.invalidRequest).send({
					okay : false,
					reason : "invalid_argument"
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
export default ViewVisualizedCached;
