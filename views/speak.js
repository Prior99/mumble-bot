import $ from "jquery";
import spawnNotification from "./notification";

global.jQuery = $;
const typeahead = require("typeahead.js-browserify").loadjQueryPlugin();
const Bloodhound = require("typeahead.js-browserify").Bloodhound;

const bloodhound = new Bloodhound({
	identify(sentence) {
		return sentence.id;
	},
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace("sentence"),
	dupDetector(a, b) {
		return a.id === b.id;
	},
	remote: {
		url: "/api/speak/lookup?text=%QUERY",
		wildcard: "%QUERY",
		transform(response) {
			return response.suggestions;
		}
	}
});

/**
 * Refresh the bestof list. This will look up the list at the REST api and display it on the table.
 * @return {undefined}
 */
const refreshBestOf = function() {
	$("#table").html("");
	const createRow = (val, key) => $("<tr><td>" +
		(key + 1) + "</td><td>" +
		val.sentence + "</td><td>" +
		val.used + "</td></tr>"
	);
	$.ajax("/api/speak/lookup").done((res) => {
		res.suggestions.map((val, key) => createRow(val, key).appendTo($("#table")))
	})
	.error((res) => spawnNotification("error", "Konnte Bestenliste nicht laden."));
}

$("#form").submit((e) => {
	e.preventDefault();
	$.ajax("/api/speak/speak?text=" + encodeURI($("#input").val())).done((res) => {
		if(res.okay) {
			spawnNotification("success", "Erfolgreich gesprochen.");
			bloodhound.clear();
			refreshBestOf();
		}
	})
	.error((res) => {
		spawnNotification("error", "Konnte Text nicht sprechen.");
	});
});

$("#input").typeahead(null, {
	name: "sentence",
	display: "sentence",
	source: bloodhound,
	templates: {
		suggestion(value) {
			return "<div><strong>" + value.sentence + "</strong>  (" + value.used + ")</div>";
		}
	}
});
refreshBestOf();
