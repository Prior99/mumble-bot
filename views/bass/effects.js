var $ = require("jquery");
var spawnNotification = require("../notification");

function refreshList() {
	$.ajax("/api/bass/effects").done(function(res) {
		if(res.okay) {
			$("#effect-list").html("");
			var effects = res.effects;
			for(var i in effects) {
				var e = effects[i];
				$("#effect-list").append("<li class='list-group-item'>" + e + "</li>");
			}
		}
	})
	.error(function() {
		spawnNotification('error', "Konnte Liste von Effekten nicht abrufen.");
	});
}
refreshList();

$("#submit").click(function() {
	var quote = $("#effect").val();
	$.ajax("/api/bass/addEffect?effect=" + encodeURI(quote)).done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Effekt erfolgreich ergänzt.");
			refreshList();
		}
	})
	.error(function() {
		spawnNotification('error', "Konnte Effekt nicht hinzufügen.");
	});
});
