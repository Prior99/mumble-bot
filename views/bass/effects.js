import $ from "jquery";
import * as spawnNotification from "../notification";

/**
 * Refresh the list of effects by polling the RESTful api.
 * @return {undefined}
 */
const refreshList = function() {
	$.ajax("/api/bass/effects").done((res) => {
		if(res.okay) {
			$("#effect-list").html("");
			const effects = res.effects;
			for(const e of effects) {
				$("#effect-list").append("<li class='list-group-item'>" + e + "</li>");
			}
		}
	})
	.error(() => spawnNotification("error", "Konnte Liste von Effekten nicht abrufen."));
};
refreshList();

$("#submit").click(() => {
	const quote = $("#effect").val();
	$.ajax("/api/bass/addEffect?effect=" + encodeURI(quote)).done((res) => {
		if(res.okay) {
			spawnNotification("success", "Effekt erfolgreich ergänzt.");
			refreshList();
		}
	})
	.error(() => spawnNotification("error", "Konnte Effekt nicht hinzufügen."));
});
