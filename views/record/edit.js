import $ from "jquery";
import spawnNotification from "../notification";

$("#submit").click((e) => {
	const quote = encodeURI($("#description").val());
	const id = $(e.currentTarget).attr("recordId");
	const labels = [];
	$(".tag-checkbox").each((i, v) => {
		if($(v).prop("checked")) {
			labels.push($(v).attr("tagId"));
		}
	});
	const jsonLabels = encodeURI(JSON.stringify(labels));
	$.ajax("/api/record/edit?id=" + id + "&quote=" + quote + "&labels=" + jsonLabels).done((res) => {
		if(res.okay) {
			window.location.href = "/record/";
		}
	})
	.error(() => spawnNotification("error", "Konnte Aufnahme nicht editieren."));
});
