var $ = require("jquery");
var spawnNotification = require("../notification");

var arr = [];
$(".designer-button").click(function() {
	var val = $(this).attr('effectValue');
	arr.push(val);
	$("#line").append("<li class='btn btn-default btn-sm list-group-item effect'>" + val + "</li>");
});

$("#play").click(function() {
	$.ajax("/api/bass/play?bass=" + encodeURI(JSON.stringify(arr))).done(function(res) {
		spawnNotification('success', "Erfolgreich abgespielt.");
		arr = [];
		$("#line").html("");
	})
	.error(function() {
		spawnNotification('error', "Konnte nicht abspielen.");
	});
});
