/**
 * View for adding a song to the current playlist in MPD.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAdd = function(bot) {
	return function(req, res) {
		const query = {};
		if(req.query.artist) {
			query.artist = req.query.artist;
		}
		if(req.query.title) {
			query.title = req.query.title;
		}
		bot.mpd.mpd.searchAdd(query, (err) => {
			if(err) {
				res.send(JSON.stringify(false));
			}
			else {
				res.send(JSON.stringify(true));
			}
		});
	}
};

export default ViewAdd;
