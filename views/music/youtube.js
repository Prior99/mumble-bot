var $ = require("jquery");
var spawnNotification = require("../notification");

function downloadFinished(response) {
}

function addElem(link) {
	var elem = $("<tr><td>" + link + "</td><td><i class=\"fa fa-cog fa-spin\"></i></td><td></td><td></td></tr>").appendTo("#vids");
	return elem;
}

function startDownload(url, format) {
	var link = "<a href=\""+ url + "\">" + url + "</a>"
	var elem = addElem(link);
	$.getJSON("/api/music/youtube?url=" + encodeURI(url) + "&format=" + encodeURI(format), function(response) {
		downloadFinished(response);
		if(response.okay) {
			elem.html("<td>" + link + "</td><td><i class=\"fa fa-check\"></i></td><td>" + response.artist + "</td><td>" + response.title + "</td>");
		}
		else {
			if(response.reason == "insufficient_permission") {
				spawnNotification('error', "Sie verfügen nicht über die nötige Berechtigung, Musik hochzuladen.");
			}
			elem.html("<td>" + link + "</td><td><i class=\"fa fa-remove\"></i></td><td></td><td></td>");
		}
	});
}

$("#go").click(function() {
	var url = $("#url").val();
	var format = $("#format").val();
	startDownload(url, format);
});
