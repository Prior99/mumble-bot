var bot;

function render(req, res) {
	var playlist = bot.mpd.mpd.playlist;
	res.render('music/playlist', {
		playlist: playlist
	});
}

module.exports = function(b) {
	bot = b;
	return render;
};
