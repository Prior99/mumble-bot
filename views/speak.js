var $ = require("jquery");
global.jQuery = $;
var typeahead = require("typeahead.js-browserify").loadjQueryPlugin();
var Bloodhound = require("typeahead.js-browserify").Bloodhound;
var spawnNotification = require("./notification");

var bloodhound = new Bloodhound({
	identify: function(sentence) {
		return sentence.id;
	},
	queryTokenizer: Bloodhound.tokenizers.whitespace,
	datumTokenizer: Bloodhound.tokenizers.obj.whitespace('sentence'),
	dupDetector: function(a, b) {
		return a.id === b.id;
	},
	remote: {
		url: '/api/speak/lookup?text=%QUERY',
		wildcard: '%QUERY',
		transform: function(response) {
			return response.suggestions;
		}
	}
});

$('#form').submit(function(e) {
	e.preventDefault();
	$.ajax("/api/speak/speak?text=" + encodeURI($("#input").val())).done(function(res) {
		if(res.okay) {
		spawnNotification('success', "Erfolgreich gesprochen.");
			bloodhound.clear();
			refreshBestOf();
		}
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Text nicht sprechen.");
	});
});

$('#input').typeahead(null, {
	name: 'sentence',
	display: 'sentence',
	source: bloodhound,
	templates: {
		suggestion: function(value) {
			return "<div><strong>" + value.sentence + "</strong>  (" + value.used + ")</div>";
		}
	}
});

function refreshBestOf() {
	$("#table").html("");
	$.ajax("/api/speak/lookup").done(function(res) {
		res.suggestions.map(function(val, key) {
			$("<tr><td>" + (key + 1) + "</td><td>" + val.sentence + "</td><td>" + val.used + "</td></tr>")
				.appendTo($("#table"));
		});
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Bestenliste nicht laden.");
	});
}
refreshBestOf();
