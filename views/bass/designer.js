import $ from "jquery";
import spawnNotification from "../notification";

let arr = [];

$(".designer-button").click(function() {
	const val = $(this).attr("effectValue");
	arr.push(val);
	$("#line").append("<li class='btn btn-default btn-sm list-group-item effect'>" + val + "</li>");
});

$("#play").click(() => {
	$.ajax("/api/bass/play?bass=" + encodeURI(JSON.stringify(arr))).done((res) => {
		spawnNotification("success", "Erfolgreich abgespielt.");
		arr = [];
		$("#line").html("");
	})
	.error(() => spawnNotification("error", "Konnte nicht abspielen."));
});
