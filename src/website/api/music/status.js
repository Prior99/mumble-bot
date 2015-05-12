module.exports = function(bot) {
	return function(req, res) {
		bot.mpd.mpd.updateStatus(function() {
			res.send(JSON.stringify(bot.mpd.mpd.status));
		});
	}
};
