/**
 * View for showing the current playlist of the MPD.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlaylist = function(bot) {
	return function(req, res) {
		const arr = [];
		const playlist = bot.mpd.mpd.playlist;
		for(const song of bot.mpd.mpd.playlist) {
			arr.push(song.flatCopy());
		}
		res.send(JSON.stringify(arr));
	}
};

export default ViewPlaylist;
