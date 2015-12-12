import * as Winston from "winston";

/**
 * <b>/sounds/</b> Displays the home page for the /sounds/ endpoint (A list of all sounds).
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Sounds = function(bot) {
	return function(req, res) {
		bot.database.listSounds((err, sounds) => {
			if(err) {
				Winston.error("Could not get list of sounds", err);
				res.locals.sounds = [];
			}
			else {
				res.locals.sounds = sounds;
			}
			res.render("sounds/sounds");
		});
	};
};

export default Sounds;
