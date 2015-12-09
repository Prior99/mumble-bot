import $ from "jquery";
import * as spawnNotification from "../notification";

$("#submit").click((e) => {
	const quote = encodeURI($("#description").val());
	const id = $(e.currentTarget).attr("recordId");
	const labels = [];
	$(".tag-checkbox").each(function() {
		if($(this).prop("checked")) {
			labels.push($(e.currentTarget).attr("tagId"));
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
