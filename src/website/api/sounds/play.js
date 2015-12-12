import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for playback endpoint of sound section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSoundPlay = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			bot.database.usedSound(req.query.id, (err) => {
				if(err) {
					Winston.error("Could not increase usages of sound", err);
					res.status(HTTPCodes.internalError).send({
						okay: false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log("verbose", req.session.user.username + " played sound #" + req.query.id);
					bot.playSound("sounds/uploaded/" + req.query.id);
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

export default ViewSoundPlay;
