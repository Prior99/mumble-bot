var $ = require("jquery");

$.getJSON("/api/music/playlist", function(data) {
	for(var i in data) {
		var song = data[i];
		var line = $("<tr></tr>")
			.append("<td>"+i+"<td>")
			.append("<td>"+song.artist+" - "+song.title+"<td>");
		$("#playlist").append(line);
	}
});
