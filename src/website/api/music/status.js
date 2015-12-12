/**
 * Status view for the music.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewStatus = function(bot) {
	return function(req, res) {
		bot.mpd.mpd.updateStatus(() => res.send(JSON.stringify(bot.mpd.mpd.status)));
	}
};

export default ViewStatus;
