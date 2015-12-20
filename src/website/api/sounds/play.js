import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * View for playback endpoint of sound section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSoundPlay = function(bot) {
	return async function(req, res) {
		if(req.query.id) {
			try {
				await bot.database.usedSound(req.query.id);
				Winston.log("verbose", req.session.user.username + " played sound #" + req.query.id);
				bot.playSound("sounds/uploaded/" + req.query.id);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				Winston.error("Could not increase usages of sound", err);
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

export default ViewSoundPlay;
