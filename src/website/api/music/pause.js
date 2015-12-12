/**
 * View for setting MPDs status to "pause".
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPause = function(bot) {
	return function(req, res) {
		bot.mpd.pause((err) => res.send(JSON.stringify(err === undefined)));
	}
};

export default ViewPause;
