var bot;

function formatTime(seconds) {
	var sec = Math.floor(seconds % 60);
	if(sec < 10) {
		sec = "0" + sec;
	}
	var min = Math.floor(seconds / 60);
	if(min < 10) {
		min = "0" + min;
	}
	return min+":"+sec
}

function _render(req, res) {
	var status = bot.mpd.mpd.status;
	var playlist = bot.mpd.mpd.playlist;
	var song;
	if(playlist[0]){
		song = playlist[0].file
	}
	res.render('music/status', {
		status: {
			state: status.state,
			total: formatTime(status.time.length),
			elapsed: formatTime(status.time.elapsed),
			playlistlength: status.playlistlength,
			song: song
		},
		playing: status.state === "play",
		hasSong: status.song === 0,
		progressing: status.time.length && status.time.elapsed
	});
}

function render(req, res) {
	bot.mpd.mpd.updateStatus(function() {
		_render(req, res);
	});
}

module.exports = function(b) {
	bot = b;
	return render;
};
