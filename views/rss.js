import $ from "jquery";
import spawnNotification from "./notification";

$("#go").click(() => {
	const url = $("#url").val();
	const name = $("#name").val();
	$.ajax("/api/rss/add?url=" + encodeURI(url) + "&name=" + encodeURI(name))
	.done((res) => {
		if(res.okay) {
			spawnNotification("success", "Feed abonniert.");
			$("#feeds").append("<li class='list-group-item'><b>" + name + "</b> " + url + "</li>")
		}
	})
	.error((res) => {
		spawnNotification("error", "Feed konnte nicht abonniert werden.");
	});
});

$("a.delete-feed").click(() => {
	const id = $(this).attr("rssId");
	const parent = $(this).parent();
	$.ajax("/api/rss/remove?id=" + id)
	.done((res) => {
		if(res.okay) {
			spawnNotification("success", "Feed gelöscht.");
			parent.remove();
		}
	})
	.error((res) => {
		spawnNotification("error", "Konnte Feed nicht löschen.");
	});
});
