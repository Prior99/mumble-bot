var bot;

function render(req, res) {
	var songs = bot.mpd.mpd.songs;
	res.render('music/songs', {
		songs: songs
	});
}

module.exports = function(b) {
	bot = b;
	return render;
};
