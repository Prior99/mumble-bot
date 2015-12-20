import $ from "jquery";
import spawnNotification from "../notification";

$("a.playdialog").click((e) => {
	const id = $(e.currentTarget).attr("dialogId");
	$.ajax("/api/record/play_dialog?id=" + id).done((res) => {
		spawnNotification("success", "Dialog erfolgreich wiedergegeben.");
	})
	.error(() => spawnNotification("error", "Konnte Dialog nicht abspielen."));
});
