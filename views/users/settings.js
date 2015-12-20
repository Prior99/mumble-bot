import $ from "jquery";
import spawnNotification from "../notification";

$("#submit").click(() => {
	const record = encodeURI($("#record").val());
	$.ajax("/api/users/settings" +
		"?record=" + record)
	.done((res) => {
		spawnNotification("success", "Einstellungen erfolgreich gespeichert.");
	})
	.error(() => {
		spawnNotification("error", "Beim Speichern der Einstellungen ist ein Fehler aufgetreten.");
	});
});

$(".link-mumble").click((event) => {
	const id = $(event.currentTarget).attr("mumbleId");
	$.ajax("/api/users/linkMumbleUser?id=" + id + "&username=" + $(event.currentTarget).attr("user"))
	.done((res) => {
		if(res.okay) {
			$("<li class='list-group-item'>" + id + "</li>").appendTo("#linked-mumble-users");
			spawnNotification("success", "Link wurde erfolgreich erstellt.");
			$(event.currentTarget).parent().remove();
		}
		else {
			spawnNotification("error", "Link konnte nicht erstellt werden.");
		}
	});
});
