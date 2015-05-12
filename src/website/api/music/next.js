module.exports = function(bot) {
	return function(req, res) {
		bot.mpd.mpd.next(function(err) {
			res.send(JSON.stringify(err === undefined));
		});
	}
};
