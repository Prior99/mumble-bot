import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for displaying all effects.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewEffects = function(bot) {
	return function(req, res) {
		bot.database.listBassEffects((err, effects) => {
			if(err) {
				Winston.error("Unabled to get list of effects", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				res.send({
					okay : true,
					effects
				});
			}
		});
	}
};

export default ViewEffects;
