import $ from "jquery";

$.getJSON("/api/music/playlist", (data) => {
	for(const i in data) {
		if(data.hasOwnProperty(i)) {
			const song = data[i];
			const line = $("<tr></tr>")
				.append("<td>"+i+"<td>")
				.append("<td>"+song.artist+" - "+song.title+"<td>");
			$("#playlist").append(line);
		}
	}
});
