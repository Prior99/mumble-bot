import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * View for playing back a cached audio
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlayCached = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			const sound = bot.getCachedAudioById(req.query.id);
			if(sound) {
				bot.playSound(sound.file);
				Winston.log("verbose", req.session.user.username + " played back cached record #" + req.query.id);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			else {
				res.status(HTTPCodes.invalidArgument).send({
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
export default ViewPlayCached;
