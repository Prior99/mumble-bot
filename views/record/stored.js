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

location.hash.substr(2).split("&").forEach(function(item) {
	var kv = item.split("=");
	hash[kv[0]] = kv[1];
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
	location.hash = "?search=" + query + "&page=" + page + "&sort=" + sort + "&order=" + order;
}

function setResultList(list) {
	var html = ListTemplate({
		records : list
	});
	$("#recordsTable").html(html);
}

function search() {
	refreshHash();
	currentList = records.filter(function(record) {
		return record.quote.toLowerCase().indexOf(query) != -1;
	})
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

$("a.playrecord").click(function() {
	var id = $(this).attr('recordId');
	$.ajax("/api/record/play?id=" + id).done(function(res) {
		spawnNotification('success', "Aufnahme erfolgreich wiedergegeben.");
	})
	.error(function() {
		spawnNotification('error', "Konnte Aufnahme nicht abspielen.");
	});
});
