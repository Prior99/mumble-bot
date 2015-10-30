var $ = require("jquery");

$.getJSON("/api/music/songs", function(songs) {
	songs.sort(function (a,b) {
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
	for(var i in songs) {
		(function(song) {
			var add = $('<a class="btn btn-xs btn-success"><span class="fa fa-plus" aria-hidden="true"></span></a>').click(function() {
				$.getJSON("/api/music/add?artist=" + song.artist + "&title=" + song.title, function() {
					//reloadSongs();
				});
			});
			var line = $("<tr></tr>").append("<td>" + song.artist + " - " + song.title + "<td>");
			line.append($('<td><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>'));
			line.append($("<td></td>").append(add));
			$("#songs").append(line);
		})(songs[i]);
	}
});
