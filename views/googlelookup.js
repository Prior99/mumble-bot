var $ = require("jquery");
var spawnNotification = require("./notification");

$('#form').submit(function(e) {
	$(".result-list").html("");
	$(".result").hide();
	e.preventDefault();
	$.ajax("/api/google?string=" + encodeURIComponent($("#input").val()))
	.done(function(res) {
		if(res.okay) {
			spawnNotification("success", "Abfrage erfolgreich durchgeführt.");
		}
		for(var i in res.results) {
			var s = res.results[i];
			$(".result-list").append("<li class='list-group-item'>" + s + "</li>");
		}
		$("#amount").html(res.results.length);
		$(".result").show();
	})
	.error(function() {
		spawnNotification("error", "Konnte Abfrage nicht durchführen!");
	});
});
