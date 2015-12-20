import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * View for displaying all effects.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewEffects = function(bot) {
	return async function(req, res) {
		try {
			const effects = await bot.database.listBassEffects();
			res.send({
				okay : true,
				effects
			});
		}
		catch(err) {
			Winston.error("Unabled to get list of effects", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	}
};

export default ViewEffects;
