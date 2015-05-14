module.exports = function(bot) {
	return function(req, res) {
		bot.mpd.mpd._updateSongs(function() {
			var arr = [];
			var songs = bot.mpd.mpd.songs;
			for(var i in bot.mpd.mpd.songs) {
				arr.push(songs[i].flatCopy());
			}
			res.send(JSON.stringify(arr));
		});
	}
};
