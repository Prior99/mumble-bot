import * as Winston from "winston";

/**
 * <b>/bass/designer/</b> Page for generating bass songs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Creator = function(bot) {
	return function(req, res) {
		bot.database.listBassEffects((err, effects) => {
			if(err) {
				Winston.error("Unable to fetch list of effects", err);
				effects = [];
			}
			res.locals.effects = effects;
			res.render("bass/designer");
		})
	}
};

export default Creator;
