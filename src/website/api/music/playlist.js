module.exports = function(bot) {
	return function(req, res) {
		var arr = [];
		var playlist = bot.mpd.mpd.playlist;
		for(var i in bot.mpd.mpd.playlist) {
			arr.push(playlist[i].flatCopy());
		}
		res.send(JSON.stringify(arr));
	}
};
