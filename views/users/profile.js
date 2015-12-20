import $ from "jquery";
import spawnNotification from "../notification";

$("a.playrecord").click(() => {
	const id = $(this).attr("recordId");
	$.ajax("/api/record/play?id=" + id).done((res) => {
		spawnNotification("success", "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(() => {
		spawnNotification("error", "Konnte Aufnahme nicht abspielen.");
	});
});
