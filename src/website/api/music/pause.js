module.exports = function(bot) {
	return function(req, res) {
		bot.mpd.pause(function(err) {
			res.send(JSON.stringify(err === undefined));
		});
	}
};
