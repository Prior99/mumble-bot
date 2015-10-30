var $ = require("jquery");
var spawnNotification = require("../notification");

$("#submit").click(function() {
	var quote = encodeURI($("#description").val());
	var id = $(this).attr('recordId');
	var labels = [];
	$(".tag-checkbox").each(function() {
		if($(this).prop('checked')) {
			labels.push($(this).attr('tagId'));
		}
	});
	var jsonLabels = encodeURI(JSON.stringify(labels));
	$.ajax("/api/record/edit?id=" + id + "&quote=" + quote + "&labels=" + jsonLabels).done(function(res) {
		if(res.okay) {
			window.location.href = "/record/";
		}
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht editieren.");
	});
});
