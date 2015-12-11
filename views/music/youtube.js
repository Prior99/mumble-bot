import $ from "jquery";
import * as spawnNotification from "../notification";

/**
 * Called when the download from youtube is finished.
 * @param {object} response - The response received from the server.
 * @return {undefined}
 */
const downloadFinished = function(response) {
}

/**
 * Adds a new entry to the table of results.
 * @param {string} link - The URL to the video.
 * @return {jQuery} - The created element.
 */
const addElem = function(link) {
	const elem = $("<tr><td>" +
		link + "</td><td>" +
		"<i class=\"fa fa-cog fa-spin\"></i></td><td></td><td></td></tr>"
	)
	.appendTo("#vids");
	return elem;
}

/**
 * Make the server start the download.
 * @param {string} url - The url of the video to download.
 * @param {string} format - The format of the title of the video.
 * @return {undefined}
 */
startDownload = function(url, format) {
	const link = "<a href=\""+ url + "\">" + url + "</a>"
	const elem = addElem(link);
	$.getJSON("/api/music/youtube?url=" + encodeURI(url) + "&format=" + encodeURI(format), (response) => {
		downloadFinished(response);
		if(response.okay) {
			elem.html("<td>" +
				link + "</td><td>" +
				"<i class=\"fa fa-check\"></i></td><td>" +
				response.artist + "</td><td>" +
				response.title + "</td>"
			);
		}
		else {
			if(response.reason === "insufficient_permission") {
				spawnNotification("error",
					"Sie verfügen nicht über die nötige Berechtigung, Musik hochzuladen."
				);
			}
			elem.html("<td>" + link + "</td><td><i class=\"fa fa-remove\"></i></td><td></td><td></td>");
		}
	});
}

$("#go").click(() => {
	const url = $("#url").val();
	const format = $("#format").val();
	startDownload(url, format);
});
