module.exports = function(bot) {
	return function(req, res) {
		var query = {};
		if(req.query.artist) {
			query.artist = req.query.artist;
		}
		if(req.query.title) {
			query.title = req.query.title;
		}
		bot.mpd.mpd.searchAdd(query, function(err) {
			if(err) {
				res.send(JSON.stringify(false));
			}
			else {
				res.send(JSON.stringify(true));
			}
		});
	}
};
