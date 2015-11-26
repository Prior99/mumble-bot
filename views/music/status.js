var $ = require("jquery");

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

function formatSong(song) {
	return song.artist + " - " + song.title;
}

function displayStatus(playlist, status) {
	var infotable = $("#infotable");
	infotable.html("");
	if(status.time && status.time.length && status.time.elapsed) {
		var elapsed = status.time.elapsed;
		var percent = (elapsed / status.time.length)*100 + "%";
		$("#progressbar").css({"width":percent});
		infotable.append('<tr><td>Zeit:</td><td><span class="glyphicon glyphicon-time" aria-hidden="true"></span> ' + formatTime(status.time.length) + "</td></tr>");
		infotable.append('<tr><td>Vergangen:</td><td><span class="glyphicon glyphicon-time" aria-hidden="true"></span> ' + formatTime(elapsed) + "</td></tr>");
	}
	else {
		$("#progressbar").css({"width":"0%"});
		infotable.append('<tr><td>Zeit:</td><td><span class="glyphicon glyphicon-time" aria-hidden="true"></span> --:--</td></tr>');
		infotable.append('<tr><td>Vergangen:</td><td><span class="glyphicon glyphicon-time" aria-hidden="true"></span> --:--</td></tr>');
	}
	if(status.song == 0) {
		infotable.append('<tr><td>Aktueller Song:</td><td><span class="glyphicon glyphicon-headphones" aria-hidden="true"></span> ' + formatSong(playlist[0]) + "</td></tr>");
	}
	else {
		infotable.append("<tr><td>Aktueller Song:</td><td>Nothing</td></tr>");
	}
	if(status.state == "play") {
		infotable.append('<tr><td>Status:</td><td><span class="glyphicon glyphicon-play" aria-hidden="true"></span> Playing</td></tr>');
	}
	else {
		infotable.append('<tr><td>Status:</td><td><span class="glyphicon glyphicon-pause" aria-hidden="true"></span> Paused</td></tr>');
	}
	infotable.append("<tr><td>Songs in Playlist:</td><td>" + status["playlistlength"] + "</td></tr>");
}

function cleanUp() {
	$("#time_elapsed").html("");
	$("#time_total").html("");
	$("#progressbar_wrapper").html("");
}

function refreshStatus() {
	$.getJSON("/api/music/playlist", function(playlist) {
		$.getJSON("/api/music/status", function(status) {
			displayStatus(playlist, status);
		});
	});
}

setInterval(function() {
	refreshStatus();
}, 2000);

$("#play").click(function() {
	$.getJSON("/api/music/play", refreshStatus);
});
$("#pause").click(function() {
	$.getJSON("/api/music/pause", refreshStatus);
});
$("#next").click(function() {
	$.getJSON("/api/music/next", refreshStatus);
});

refreshStatus();
