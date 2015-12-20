import $ from "jquery";
import spawnNotification from "../notification";

$("#submit").click((e) => {
	const quote = encodeURI($("#description").val());
	const labels = [];
	$(".tag-checkbox").each(() => {
		if($(e.currentTarget).prop("checked")) {
			labels.push($(e.currentTarget).attr("tagId"));
		}
	});
	const jsonLabels = encodeURI(JSON.stringify(labels));
	const recordId = $(e.currentTarget).attr("recordId");
	$.ajax("/api/record/save?id=" + recordId + "&quote=" + quote + "&labels=" + jsonLabels).done((res) => {
		if(res.okay) {
			window.location.href = "/record/";
		}
	})
	.error(() => spawnNotification("error", "Konnte Aufnahme nicht speichern."));
});
