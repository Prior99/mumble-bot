function playdialog() {
	var id = $(this).attr('dialogId');
	$.ajax("/api/record/play_dialog?id=" + id).done(function(res) {
		spawnNotification('success', "Dialog erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Dialog nicht abspielen.");
	});
}

$("a.playdialog").click(playdialog);
