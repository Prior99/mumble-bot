import * as Winston from "winston";

/**
 * This view handels the playback of quotes.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSpeak = function(bot) {
	return function(req, res) {
		Winston.log("verbose", req.session.user.username + " playing quote #" + req.query.id);
		bot.quotes.speak(req.query.id);
		res.send(JSON.stringify({
			okay : true
		}));
	}
};

export default ViewSpeak;
