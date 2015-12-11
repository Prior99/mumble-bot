import $ from "jquery";
import * as spawnNotification from "./notification";

$("#form").submit((e) => {
	$(".result-list").html("");
	$(".result").hide();
	e.preventDefault();
	$.ajax("/api/google?string=" + encodeURIComponent($("#input").val()))
	.done((res) => {
		if(res.okay) {
			spawnNotification("success", "Abfrage erfolgreich durchgeführt.");
		}
		for(const s of res.results) {
			$(".result-list").append("<li class='list-group-item'>" + s + "</li>");
		}
		$("#amount").html(res.results.length);
		$(".result").show();
	})
	.error(() => spawnNotification("error", "Konnte Abfrage nicht durchführen!"));
});
