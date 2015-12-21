import $ from "jquery";
import spawnNotification from "../notification";

$(".playsound").click((e) => {
	const id = $(e.currentTarget).attr("soundsId");
	$.ajax("/api/sounds/play?id=" + id).done((res) => {
		if(res.okay) {
			spawnNotification("success", "Sound abgespielt.");
		}
	})
	.error((res) => {
		spawnNotification("error", "Konnte Sound nicht wiedergeben.");
	});
});
