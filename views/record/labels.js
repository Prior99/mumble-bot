var $ = require("jquery");
var spawnNotification = require("../notification");

$("#submit").click(function() {
	var name = encodeURI($("#name").val());
	$.ajax("/api/record/addlabel?name=" + name).done(function(res) {
		if(res.okay) {
			$("#tags").append('<tr><td><span class="label" style="background: ' + res.color + ';">' + $("#name").val() + '</span></td><td>0</td></tr>');
		}
	}).error(function(res) {
		spawnNotification('error', "Konnte Label nicht hinzufügen");
	});
});
