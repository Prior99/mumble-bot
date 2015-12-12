/**
 * View for playing the next song in MPD.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewNext = function(bot) {
	return function(req, res) {
		bot.mpd.next((err) => res.send(JSON.stringify(err === undefined)));
	}
};

export default ViewNext;
