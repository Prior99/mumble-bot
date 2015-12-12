/**
 * View for setting MPDs status to "play".
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlay = function(bot) {
	return function(req, res) {
		bot.mpd.play((err) => res.send(JSON.stringify(err === undefined)));
	}
};

export default ViewPlay;
