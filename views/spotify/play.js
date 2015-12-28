import $ from "jquery";
$("#play").click((evt) => {
	const url = $("#url").val();
	$.ajax("/api/spotify/play?url=" + encodeURIComponent(url))
	.done((res) => {

	})
	.error((res) => {

	});
});
