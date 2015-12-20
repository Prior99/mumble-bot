import Handlebars from "handlebars";
import Moment from "moment";
import $ from "jquery";
import spawnNotification from "../notification";
import colorify from "../../src/colorbystring";

Handlebars.registerHelper("paginate", require("handlebars-paginate"));
Handlebars.registerHelper("formatDate", (date) => Moment(date).format("DD.MM.YY"));
Handlebars.registerHelper("formatTime", (date) => Moment(date).format("HH:mm"));
Handlebars.registerHelper("colorify", (string) => colorify(string));

const ListTemplate = Handlebars.compile($("#template-list").html());
const PageinationTemplate = Handlebars.compile($("#template-pageination").html());

const recordsPerPage = 20;

const hash = {};
let records;
let currentList;

location.search.substr(1).split("&").forEach((item) => {
	const kv = item.split("=");
	hash[kv[0]] = decodeURI(kv[1]);
});

let query = hash.search ? hash.search : "";
let page = +(hash.page ? hash.page : 1);
let sort = hash.sort ? hash.sort : "time";
let order = hash.order ? hash.order : "desc";

const sorters = {
	"time" : {
		asc(a, b) {
			return new Date(a.submitted) - new Date(b.submitted);
		},
		desc(a, b) {
			return new Date(b.submitted) - new Date(a.submitted);
		}
	},
	"amount" : {
		asc(a, b) {
			return a.used - b.used;
		},
		desc(a, b) {
			return b.used - a.used;
		}
	},
	"user" : {
		asc(a, b) {
			return a.user.username > b.user.username ? 1 : a.user.username < b.user.username ? -1 : 0;
		},
		desc(a, b) {
			return a.user.username > b.user.username ? -1 : a.user.username < b.user.username ? 1 : 0;
		}
	}
};

/**
 * Refresh the pageinator.
 * @return {undefined}
 */
const refreshPageination = function() {
	$("#pagination").html(PageinationTemplate({
		pagination: {
			page,
			pageCount : Math.ceil(currentList.length / recordsPerPage)
		}
	}));
}

/**
 * Refresh the page history to generate RESTful urls.
 * @return {undefined}
 */
const refreshHash = function() {
	history.pushState(null, "", "?search=" + encodeURI(query) +
		"&page=" + encodeURI(page) +
		"&sort=" + encodeURI(sort) +
		"&order=" + encodeURI(order));
}

/**
 * Recreate and apply the result list from the given list.
 * @param {array} list - List of records to apply to the template.
 * @return {undefined}
 */
const setResultList = function(list) {
	const html = ListTemplate({
		records : list
	});
	$("#recordsTable").html(html);
}

/**
 * Search for the currently given query and refresh the list.
 * @return {undefined}
 */
const search = function() {
	refreshHash();
	currentList = records;
	query.split(/\s/).forEach((part) => {
		part = part.toLowerCase();
		currentList = currentList.filter((record) => {
			if(part.substr(0, 4) === "tag:") {
				const tag = part.substr(4);
				return record.labels.find((label) => label.name.toLowerCase() === tag);
			}
			else if(part.substr(0, 5) === "user:") {
				const user = part.substr(5);
				return record.user.username.toLowerCase() === user;
			}
			else {
				return record.quote.toLowerCase().indexOf(part) !== -1;
			}
		})
	});
	setResultList(currentList
		.sort(sorters[sort][order])
		.slice((page - 1) * recordsPerPage, page * recordsPerPage));
	refreshPageination();
}

refreshHash();
$("#search").val(query);

$.ajax("/api/record/list").done((res) => {
	$("#loading").remove();
	$("#records").show();

	records = res.records;
	search();
})
.error((err) => {
	spawnNotification("error", "Konnte Liste von Aufnahmen nicht laden.");
});

$("#search").keyup((e) => {
	const string = $(e.currentTarget).val().toLowerCase();
	page = 1;
	query = string;
	search();
});

$("a.recordsort").click((e) => {
	sort = $(e.currentTarget).attr("sortType");
	order = $(e.currentTarget).attr("sortOrder");
	search();
});

$(document).on("click", "a.pageinate", (e) => {
	page = +$(e.currentTarget).attr("pageNumber");
	search();
});

$(document).on("click", "a.playrecord", (e) => {
	const id = $(e.currentTarget).attr("recordId");
	$.ajax("/api/record/play?id=" + id)
	.done((res) => spawnNotification("success", "Aufnahme erfolgreich wiedergegeben."))
	.error(() => spawnNotification("error", "Konnte Aufnahme nicht abspielen."));
});

$(document).on("click", "a.label", (e) => {
	const label = $(e.currentTarget).attr("tagName").toLowerCase();
	const sval = $("#search").val();
	if(sval.length) {
		$("#search").val($("#search").val() + " tag:" + label)
	}
	else {
		$("#search").val("tag:" + label);
	}
	query = $("#search").val();
	search();
});

$(document).on("click", "a.username", (e) => {
	const label = $(e.currentTarget).attr("userName").toLowerCase();
	const sval = $("#search").val();
	if(sval.length) {
		$("#search").val($("#search").val() + " user:" + label)
	}
	else {
		$("#search").val("user:" + label);
	}
	query = $("#search").val();
	search();
});
