function playrecord() {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/play?id=" + id).done(function(res) {
		spawnNotification('success', "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht abspielen.");
	});
}

$('a.playrecord').click(playrecord);
