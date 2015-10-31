var Handlebars = require("handlebars");
var Moment = require("moment");
var $ = require("jquery");
var spawnNotification = require("../notification");
var colorify = require("../../src/colorbystring")

Handlebars.registerHelper('paginate', require('handlebars-paginate'));

Handlebars.registerHelper("formatDate", function(date) {
	return Moment(date).format("DD.MM.YY");
});

Handlebars.registerHelper("formatTime", function(date) {
	return Moment(date).format("HH:mm");
});

Handlebars.registerHelper("colorify", function(string) {
	return colorify(string);
});

var ListTemplate = Handlebars.compile($("#template-list").html());
var PageinationTemplate = Handlebars.compile($("#template-pageination").html());

var recordsPerPage = 20;

var hash = {};
var records;
var currentList;

location.search.substr(1).split("&").forEach(function(item) {
	var kv = item.split("=");
	hash[kv[0]] = decodeURI(kv[1]);
});
var query = hash.search ? hash.search : "";
var page = +(hash.page ? hash.page : 1);
var sort = hash.sort ? hash.sort : "time";
var order = hash.order ? hash.order : "desc";
refreshHash();
$("#search").val(query);

var sorters = {
	"time" : {
		"asc" : function(a, b) {
			return new Date(a.submitted) - new Date(b.submitted);
		},
		"desc" : function(a, b) {
			return new Date(b.submitted) - new Date(a.submitted);
		}
	},
	"amount" : {
		"asc" : function(a, b) {
			return a.used - b.used;
		},
		"desc" : function(a, b) {
			return b.used - a.used;
		}
	},
	"user" : {
		"asc" : function(a, b) {
			return a.user.username > b.user.username ? 1 : a.user.username < b.user.username ? -1 : 0;
		},
		"desc" : function(a, b) {
			return a.user.username > b.user.username ? -1 : a.user.username < b.user.username ? 1 : 0;
		}
	}
};

function refreshPageination() {
	$("#pagination").html(PageinationTemplate({
		pagination: {
			page : page,
			pageCount : Math.ceil(currentList.length / recordsPerPage)
		}
	}));
}

function refreshHash() {
	history.pushState(null, "", "?search=" + encodeURI(query) +
		"&page=" + encodeURI(page) +
		"&sort=" + encodeURI(sort) +
		"&order=" + encodeURI(order));
}

function setResultList(list) {
	var html = ListTemplate({
		records : list
	});
	$("#recordsTable").html(html);
}

function search() {
	refreshHash();
	currentList = records;
	query.split(/\s/).forEach(function(part) {
		part = part.toLowerCase();
		currentList = currentList.filter(function(record) {
			if(part.substr(0, 4) == "tag:") {
				var tag = part.substr(4);
				return record.labels.find(function(label) {
					return label.name.toLowerCase() == tag;
				});
			}
			else if(part.substr(0, 5) == "user:") {
				var user = part.substr(5);
				return record.user.username.toLowerCase() == user;
			}
			else {
				return record.quote.toLowerCase().indexOf(part) != -1;
			}
		})
	});
	setResultList(currentList
		.sort(sorters[sort][order])
		.slice((page - 1) * recordsPerPage, page * recordsPerPage));
	refreshPageination();
}
$.ajax("/api/record/list").done(function(res) {
	$("#loading").remove();
	$("#records").show();

	records = res.records;
	search();
})
.error(function(err) {
	spawnNotification('error', "Konnte Liste von Aufnahmen nicht laden.");
});

$("#search").keyup(function() {
	var string = $(this).val().toLowerCase();
	page = 1;
	query = string;
	search();
});

$("a.recordsort").click(function() {
	sort = $(this).attr('sortType');
	order = $(this).attr('sortOrder');
	search();
});

$(document).on('click', 'a.pageinate', function() {
	page = +$(this).attr('pageNumber');
	search();
});

$(document).on('click', 'a.playrecord', function() {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/play?id=" + id).done(function(res) {
		spawnNotification('success', "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht abspielen.");
	});
});

$(document).on('click', 'a.label', function() {
	var label = $(this).attr('tagName').toLowerCase();
	var sval = $("#search").val();
	if(sval.length) {
		$("#search").val($("#search").val() + " tag:" + label)
	}
	else {
		$("#search").val("tag:" + label);
	}
	query = $("#search").val();
	search();
});

$(document).on('click', 'a.username', function() {
	var label = $(this).attr('userName').toLowerCase();
	var sval = $("#search").val();
	if(sval.length) {
		$("#search").val($("#search").val() + " user:" + label)
	}
	else {
		$("#search").val("user:" + label);
	}
	query = $("#search").val();
	search();
});
