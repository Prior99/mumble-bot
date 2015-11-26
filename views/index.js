require("./sidebar");
require("./tablesort");
require("bootstrap");

var $ = require("jquery");
var spawnNotification = require("./notification");

$('#nav-sign-out').click(function() {
	$.ajax("/api/users/logout").done(function(res) {
		window.location.reload();
	});
})
$('#quiet-nav-btn').click(function() {
	$.ajax("/api/command?command=be%20quiet").done(function(res) {
		spawnNotification('success', "Ausgabe von Sound sollte zeitnah aufhören.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Befehl nicht ausführen.");
	});
})
