var Handlebars = require("handlebars");
var Moment = require("moment");
var $ = require("jquery");
var spawnNotification = require("../notification");

var ListTemplate = Handlebars.compile($("#template-list").html());

Handlebars.registerHelper("formatDate", function(date) {
	return Moment(date).format("DD.MM.YY");
});

Handlebars.registerHelper("formatTime", function(date) {
	return Moment(date).format("HH:mm");
});

function setResultList(list) {
	var html = ListTemplate({
		records : list
	});
	$("#recordsTable").html(html);
}

function initSearch(records) {
	$("#search").keyup(function() {
		var string = $(this).val();

	});
}

$.ajax("/api/record/list").done(function(res) {
	$("#loading").remove();
	$("#records").show();
	setResultList(res.records);
	initSearch(res.records);
})
.error(function(err) {
	spawnNotification('error', "Konnte Liste von Aufnahmen nicht laden.");
});


$("a.playrecord").click(function() {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/play?id=" + id).done(function(res) {
		spawnNotification('success', "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht abspielen.");
	});
});
