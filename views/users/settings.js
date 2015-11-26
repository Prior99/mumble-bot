var $ = require("jquery");
var spawnNotification = require("../notification");

$('#submit').click(function() {
	var record = encodeURI($('#record').val());
	$.ajax("/api/users/settings" +
		"?record=" + record)
	.done(function(res) {
		spawnNotification('success', "Einstellungen erfolgreich gespeichert.");
	})
	.error(function() {
		spawnNotification('error', "Beim Speichern der Einstellungen ist ein Fehler aufgetreten.");
	});
});

$(".link-mumble").click(function() {
	var id = $(this).attr('mumbleId');
	$.ajax("/api/users/linkMumbleUser?id=" + id + "&username=" + $(this).attr('user'))
	.done(function(res) {
		if(res.okay) {
			$("<li class='list-group-item'>" + id + "</li>").appendTo("#linked-mumble-users");
			spawnNotification('success', "Link wurde erfolgreich erstellt.");
			$(this).parent().remove();
		}
		else {
			spawnNotification('error', "Link konnte nicht erstellt werden.");
		}
	}.bind(this));
});
