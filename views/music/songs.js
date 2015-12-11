import $ from "jquery";

$.getJSON("/api/music/songs", (songs) => {
	songs.sort((a, b) => {
		if(a.artist < b.artist) {
			return -1;
		}
		else if(a.artist > b.artist) {
			return 1;
		}
		else {
			if(a.title < b.title) {
				return -1;
			}
			else if(a.title > b.title) {
				return 1;
			}
			else {
				return 0;
			}
		}
	});

	/**
	 * Add a song to the playlist using the REST api.
	 * @param {object} song - The song to add to the playlist.
	 * @param {string} song.artist - The artist of the song.
	 * @param {string} song.title - The title of the song.
	 * @return {undefined}
	 */
	const addSongToPlaylist = function(song) {
		$.getJSON("/api/music/add?artist=" + song.artist + "&title=" + song.title, () => {
			//reloadSongs();
		});
	};

	/**
	 * Display a song in the table.
	 * @param {object} song - The song to add to the playlist.
	 * @param {string} song.artist - The artist of the song.
	 * @param {string} song.title - The title of the song.
	 * @return {undefined}
	 */
	const displaySong = function(song) {
		const add = $("<a class='btn btn-xs btn-success'><span class='fa fa-plus' aria-hidden='true'></span></a>")
			.click(() => addSongToPlaylist(song));
		const line = $("<tr></tr>").append("<td>" + song.artist + " - " + song.title + "<td>");
		line.append($("<td><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></td>"));
		line.append($("<td></td>").append(add));
		$("#songs").append(line);
	};

	for(const song in songs) {
		if(songs.hasOwnProperty(song)) {
			displaySong(song);
		}
	}
});
