import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * View for playing back a cached audio
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const PlayCached = function(bot) {
	return function(req, res) {
		if(req.body.id) {
			const sound = bot.getCachedAudioById(+req.body.id);
			if(sound) {
				bot.playSound(sound.file, {
					type: "cached",
					details: sound,
					user: req.user
				});
				Winston.log("verbose", `${req.user.username} played back cached record #${req.body.id}`);
				res.status(HTTPCodes.okay).send(true);
			}
			else {
				res.status(HTTPCodes.invalidRequest).send({
					reason: "invalid_argument"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				reason: "missing_arguments"
			});
		}
	};
};
export default PlayCached;
