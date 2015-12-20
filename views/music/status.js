import $ from "jquery";
import spawnNotification from "../notification";

/**
 * Properly format the received time in seconds.
 * @param {number} seconds - The time in seconds that should be formatted.
 * @return {string} - The time as string in the format hh:mm:ss
 */
const formatTime = function(seconds) {
	const secondsPerMinute = 60;
	const minutesPerHour = 60;
	let sec = Math.floor(seconds % secondsPerMinute);
	if(sec < 10) {
		sec = "0" + sec;
	}
	let min = Math.floor(seconds / minutesPerHour);
	if(min < 10) {
		min = "0" + min;
	}
	return min + ":" + sec
}

/**
 * Format the song to a readable string.
 * @param {object} song - The song to format.
 * @param {string} song.artist - The artist of the song.
 * @param {string} song.title - The title of the song.
 * @return {string} - The formatted song in the format "artist - title".
 */
const formatSong = function(song) {
	return song.artist + " - " + song.title;
}

/**
 * Display the current status on the webpage.
 * @see node-mpd for more information.
 * @param {object[]} playlist - The current playlist.
 * @param {string} playlist.artist - The artist of the song.
 * @param {string} playlist.title - The title of the song.
 * @param {object} status - The current status of the MPD.
 * @param {object} status.time - The current time.
 * @param {object} status.time.length - The overall playing time.
 * @param {object} status.time.elapsed - The elapsed time.
 * @param {object} status.playlistlength - Amount of items in the playlist.
 * @param {object} status.song - The currently playing song.
 * @param {object} status.state - The current state of the player (for example "play" or "pause").
 * @return {undefined}
 */
const displayStatus = function(playlist, status) {
	const infotable = $("#infotable");
	infotable.html("");
	if(status.time && status.time.length && status.time.elapsed) {
		const elapsed = status.time.elapsed;
		const maxPercent = 100;
		const percent = (elapsed / status.time.length) * maxPercent + "%";
		$("#progressbar").css({
			"width" : percent
		});
		infotable.append(
			"<tr><td>Zeit:</td><td><span class='glyphicon glyphicon-time' aria-hidden='true'></span> " +
			formatTime(status.time.length) + "</td></tr>"
		);
		infotable.append(
			"<tr><td>Vergangen:</td><td><span class='glyphicon glyphicon-time' aria-hidden='true'></span> " +
			formatTime(elapsed) + "</td></tr>"
		);
	}
	else {
		$("#progressbar").css({"width":"0%"});
		infotable.append(
			"<tr><td>Zeit:</td><td><span class='glyphicon glyphicon-time' aria-hidden='true'></span>" +
			"--:--</td></tr>"
		);
		infotable.append(
			"<tr><td>Vergangen:</td><td><span class='glyphicon glyphicon-time' aria-hidden='true'></span>" +
			"--:--</td></tr>"
		);
	}
	if(status.song === 0) {
		infotable.append(
			"<tr><td>Aktueller Song:</td><td><span class='glyphicon glyphicon-headphones' aria-hidden='true'></span> " +
			formatSong(playlist[0]) + "</td></tr>"
		);
	}
	else {
		infotable.append("<tr><td>Aktueller Song:</td><td>Nothing</td></tr>");
	}
	if(status.state === "play") {
		infotable.append(
			"<tr><td>Status:</td>" +
			"<td><span class='glyphicon glyphicon-play' aria-hidden='true'></span> Playing</td></tr>"
		);
	}
	else {
		infotable.append(
			"<tr><td>Status:</td>" +
			"<td><span class='glyphicon glyphicon-pause' aria-hidden='true'></span> Paused</td></tr>"
		);
	}
	infotable.append("<tr><td>Songs in Playlist:</td><td>" + status["playlistlength"] + "</td></tr>");
}

/**
 * Clean the table. Removes the content from all rows.
 * @return {undefined}
 */
const cleanUp = function() {
	$("#time_elapsed").html("");
	$("#time_total").html("");
	$("#progressbar_wrapper").html("");
}

/**
 * Refresh the status by polling the RESTful api and displaying the status.
 * @return {undefined}
 */
const refreshStatus = function() {
	$.getJSON("/api/music/playlist", (playlist) => {
		$.getJSON("/api/music/status", (status) => displayStatus(playlist, status));
	});
}

const twoSeconds = 2000;
setInterval(() => refreshStatus(), twoSeconds);

$("#play").click(() => $.getJSON("/api/music/play", refreshStatus));
$("#pause").click(() => $.getJSON("/api/music/pause", refreshStatus));
$("#next").click(() => $.getJSON("/api/music/next", refreshStatus));

refreshStatus();
