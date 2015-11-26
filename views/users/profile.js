var $ = require("jquery");
var spawnNotification = require("../notification");

$("a.playrecord").click(function() {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/play?id=" + id).done(function(res) {
		spawnNotification('success', "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht abspielen.");
	});
});
