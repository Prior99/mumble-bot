var $ = require("jquery");
var spawnNotification = require("../notification");
var Handlebars = require("handlebars");

var DialogTemplate = Handlebars.compile($("#template-dialog").html());
var SuggestionsTemplate = Handlebars.compile($("#template-record-suggestions").html());

var currentDialog = [];

Handlebars.registerHelper("plusOne", function(i) {
	return i + 1;
});

Handlebars.registerHelper("ifFirst", function(i, block) {
	if(i == 0) {
		return block.fn(this);
	}
});

Handlebars.registerHelper("ifLast", function(i, block) {
	if(i == currentDialog.length - 1) {
		return block.fn(this);
	}
});

function saveHandler(e) {
	e.preventDefault();

	if(currentDialog.length < 2) {
		spawnNotification('error', "Dialog ist zu kurz.");
		return;
	}

	var ids = currentDialog.map(function(record) {
		return record.id;
	});

	var jsonIDs = encodeURI(JSON.stringify(ids));
	$.ajax("/api/record/save_dialog?dialog=" + jsonIDs)
	.done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Erfolgreich gespeichert.");
			location.href = "/record/dialogs/";
		}
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Dialog nicht speichern.");
	});
}

function searchHandler(e) {
	e.preventDefault();
	updateSearchResults();
}

function addrecord(e) {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/get?id=" + encodeURI(id))
	.done(function(res) {
		var pos = currentDialog.length;
		currentDialog.push(res.record);
		refreshDialog();
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Info der ausgewählten Aufnahme nicht laden.");
	});
}

function remrecord(e) {
	var index = $(this).attr('index');
	currentDialog.splice(index, 1);
	refreshDialog();
}

function uprecord(e) {
	var index = +$(this).attr('index');
	if(index > 0) {
		var val1 = currentDialog[index];
		var val2 = currentDialog[index - 1];
		currentDialog[index] = val2;
		currentDialog[index - 1] = val1;
		refreshDialog();
	}
}

function downrecord(e) {
	var index = +$(this).attr('index');
	if(index < currentDialog.length - 1) {
		var val1 = currentDialog[index];
		var val2 = currentDialog[index + 1];
		currentDialog[index] = val2;
		currentDialog[index + 1] = val1;
		refreshDialog();
	}
}

function refreshDialog() {
	$("#table").html(DialogTemplate({
		dialog : currentDialog
	}));
}

function updateSearchResults() {
	$.ajax("/api/record/lookup?text=" + encodeURI($("#input").val()))
	.done(function(res) {
		$("#results").html(SuggestionsTemplate({
			suggestions : res.suggestions
		}));
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Suchergebnisse nicht laden.");
	});
}

function playrecord() {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/play?id=" + id).done(function(res) {
		spawnNotification('success', "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht abspielen.");
	});
}

$(document).on('submit', '#save', saveHandler);
$(document).on('submit', '#search', searchHandler);
$(document).on('click', 'a.addrecord', addrecord);
$(document).on('click', 'a.remrecord', remrecord);
$(document).on('click', 'a.uprecord', uprecord);
$(document).on('click', 'a.downrecord', downrecord);
$(document).on('click', 'a.playrecord', playrecord);
