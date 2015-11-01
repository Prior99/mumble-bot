var $ = require("jquery");
var spawnNotification = require("../notification");
var WebSocket = require("ws"); //returns global.WebSocket
var Handlebars = require('handlebars');
var Moment = require("moment");

Handlebars.registerHelper("formatDate", function(date) {
	return Moment(date).format("DD.MM.YY");
});

Handlebars.registerHelper("formatTime", function(date) {
	return Moment(date).format("HH:mm:ss");
});

Handlebars.registerHelper("bootstrapClassIfProtected", function(audio) {
	if(audio.protected) {
		return 'warning';
	}
	else {
		return '';
	}
});

var ListTemplate = Handlebars.compile($('#template-cached').html());

var url = location.href.replace('http', 'ws');
var list = [];

if(url.substr(-1) === '/') {
	url = url.substr(0, url.length - 1);
}

var ws = new WebSocket(url);

function refreshList() {
	$("#cachedtable").html(ListTemplate({
		cached : list.sort(function(a, b) {
			if(a.protected && !b.protected) {
				return -1;
			}
			else if(!a.protected && b.protected) {
				return 1;
			}
			else {
				return new Date(b.date) - new Date(a.date);
			}
		})
	}));
}

function init(obj) {
	$("#loading").remove();
	$("#cached").show();
	list = obj.list;
	refreshList();
}

function add(obj) {
	list.unshift(obj);
	refreshList();
}

function remove(id) {
	list = list.filter(function(elem) {
		return elem.id !== id;
	});
	refreshList();
}

function protect(id) {
	var e = list.find(function(elem) {
		return elem.id == id;
	});
	if(e) {
		e.protected = true;
	}
	refreshList();
}

ws.onmessage = function(msg) {
	var obj = JSON.parse(msg.data);
	console.log(obj);
	if(obj.type === 'init') {
		init(obj);
	}
	else if(obj.type === 'add') {
		add(obj.audio);
	}
	else if(obj.type === 'remove') {
		remove(obj.id);
	}
	else if(obj.type === 'protect') {
		protect(obj.id);
	}
	else {
		console.error("Received packet of invalid type", obj);
	}
};

ws.onopen = function() {
	$("#description").html("Warte auf Liste von Aufnahmen...");
};

$(document).on('click', 'a.protectbutton', function() {
	var id = $(this).attr("soundId");
	var t = $(this);
	$.ajax("/api/record/protect?id=" + id).done(function(response) {
		spawnNotification('success', "Aufnahme geschützt.");
		//console.log($(this).parent().parent());
		//t.parent().parent().addClass('warning');
		//t.parent().parent().find('td.protectindicate').html('').append('<i class="fa fa-check" aria-hidden="true"></i><span style="display: none">1</div>');
	}).error(function() {
		spawnNotification('error', "Schützen fehlgeschlagen.");
	});
});
$(document).on('click', 'a.deletebutton', function() {
	var id = $(this).attr("soundId");
	var t = $(this);
	$.ajax("/api/record/deletecached?id=" + id).done(function(response) {
		spawnNotification('success', "Aufnahme gelöscht.");
		//t.parent().parent().remove();
	}).error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht löschen.");
	});
});
$(document).on('click', 'a.playbutton', function() {
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
