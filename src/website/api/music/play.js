module.exports = function(bot) {
	return function(req, res) {
		bot.mpd.mpd.play(function(err) {
			res.send(JSON.stringify(err === undefined));
		});
	}
};
