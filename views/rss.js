var $ = require("jquery");
var spawnNotification = require("./notification");

$("#go").click(function() {
	var url = $("#url").val();
	var name = $("#name").val();
	$.ajax("/api/rss/add?url=" + encodeURI(url) + "&name=" + encodeURI(name))
	.done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Feed abonniert.");
			$("#feeds").append("<li class='list-group-item'><b>" + name + "</b> " + url + "</li>")
		}
	})
	.error(function(res) {
		spawnNotification('error', "Feed konnte nicht abonniert werden.");
	});
});
$("a.delete-feed").click(function() {
	var id = $(this).attr("rssId");
	var parent = $(this).parent();
	$.ajax("/api/rss/remove?id=" + id)
	.done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Feed gelöscht.");
			parent.remove();
		}
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Feed nicht löschen.");
	});
});
