/**
 * View for listing the songs of the MPD.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSongs = function(bot) {
	return function(req, res) {
		bot.mpd.mpd._updateSongs(() => {
			const arr = [];
			const songs = bot.mpd.mpd.songs;
			for(const song of bot.mpd.mpd.songs) {
				arr.push(song.flatCopy());
			}
			res.send(JSON.stringify(arr));
		});
	}
};

export default ViewSongs;
