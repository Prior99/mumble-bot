import $ from "jquery";
import spawnNotification from "../notification";

$("#submit").click(() => {
	let name = $("#name").val();
	if(name.indexOf(" ") !== -1) {
		spawnNotification("error", "Labels dürfen keine Leerzeichen enthalten.");
	}
	else {
		name = encodeURI(name);
		$.ajax("/api/record/addlabel?name=" + name).done((res) => {
			if(res.okay) {
				$("#tags").append("<tr><td><span class='label' style='background: " +
					res.color + ";'>" + $("#name").val() + "</span></td><td>0</td></tr>");
			}
		}).error((res) => spawnNotification("error", "Konnte Label nicht hinzufügen"));
	}
});
