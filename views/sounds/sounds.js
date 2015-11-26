var $ = require("jquery");
var spawnNotification = require("../notification");

$(".playsound").click(function(e) {
	var id = $(this).attr('soundsId');
	$.ajax("/api/sounds/play?id=" + id).done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Sound abgespielt.");
		}
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Sound nicht wiedergeben.");
	});
});
