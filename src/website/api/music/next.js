module.exports = function(bot) {
	return function(req, res) {
		bot.mpd.next(function(err) {
			res.send(JSON.stringify(err === undefined));
		});
	}
};
