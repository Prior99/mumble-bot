var $ = require("jquery");
var spawnNotification = require("../notification");

$('a.protectbutton').click(function() {
	var id = $(this).attr("soundId");
	var t = $(this);
	$.ajax("/api/record/protect?id=" + id).done(function(response) {
		spawnNotification('success', "Aufnahme geschützt.");
		console.log($(this).parent().parent());
		t.parent().parent().addClass('warning');
		t.parent().parent().find('td.protectindicate').html('').append('<i class="fa fa-check" aria-hidden="true"></i><span style="display: none">1</div>');
	}).error(function() {
		spawnNotification('error', "Schützen fehlgeschlagen.");
	});
});
$('a.deletebutton').click(function() {
	var id = $(this).attr("soundId");
	var t = $(this);
	$.ajax("/api/record/deletecached?id=" + id).done(function(response) {
		spawnNotification('success', "Aufnahme gelöscht.");
		t.parent().parent().remove();
	}).error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht löschen.");
	});
});
$('a.playbutton').click(function() {
	var id = $(this).attr("soundId");
	$.ajax("/api/record/playcached?id=" + id).done(function(response) {
		if(response.okay) {
			spawnNotification('success', "Datei erfolgreich wiedergegeben!");
		}
	})
	.error(function() {
		spawnNotification('error', "Konnte Datei nicht abspielen.");
	});
});
