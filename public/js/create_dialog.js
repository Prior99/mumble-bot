function tr(s) {
	return "<tr>" + s + "</tr>";
}
function td(s) {
	return "<td>" + s + "</td>";
}

var btnclass = " quote-btn btn btn-xs btn-success ";

function mkspan(c) {
	return '<span class="' + c + '" aria-hidden="true"></span>';
}

var currentDialog = [];

function saveHandler(e) {
	e.preventDefault();

	if(currentDialog.length < 2) {
		spawnNotification('error', "Dialog ist zu kurz.");
		return;
	}

	function said(record) {
		return "&lt;" + record.user.username + "&gt; " + record.quote;
	}

	var ids = [];
	var quotes = [];
	for(var pos=0; pos<currentDialog.length; pos++) {
		ids[pos] = currentDialog[pos].id;
		quotes[pos] = said(currentDialog[pos]);
	}
	var jsonIDs = encodeURI(JSON.stringify(ids));
	var jsonQuotes = encodeURIComponent(JSON.stringify(quotes));

	$.ajax("/api/record/save_dialog?dialog=" + jsonIDs + "&quotes=" + jsonQuotes)
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
		var bspan = mkspan("fa fa-volume-down"); // TODO change to X (delete) icon
		var button = '<a index="' +pos+ '" class="remrecord' +btnclass+ '">' +bspan+ '</a>';
		$(tr(td(pos+1) + td(res.record.user.username) + td(res.record.quote) + td(button)))
			.appendTo($("#table"));
		currentDialog.push(res.record);
		setHandlers();
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Info der ausgewählten Aufnahme nicht laden.");
	});
}

function remrecord(e) {
	var index = $(this).attr('index');
	console.log("remrecord! " + index); // TODO
}

function setHandlers() {
	$('#save').off();
	$('#search').off();
	$('a.addrecord').off();
	$('a.remrecord').off();
	$('a.playrecord').off();

	$('#save').submit(saveHandler);
	$('#search').submit(searchHandler);
	$('a.addrecord').click(addrecord);
	$('a.remrecord').click(remrecord);
	$('a.playrecord').click(playrecord);
}

function updateSearchResults() {
	$("#results").html("");
	$.ajax("/api/record/lookup?text=" + encodeURI($("#input").val()))
	.done(function(res) {
		res.suggestions.map(function(val) {
			var apan = mkspan("fa fa-plus");
			var ppan = mkspan("fa fa-volume-down");
			var autton = '<a recordId="' +val.id+ '" class="addrecord' +btnclass+ '">' +apan+ '</a>';
			var putton = '<a recordId="' +val.id+ '" class="playrecord' +btnclass+ '">' +ppan+ '</a>';
			$(tr(td(val.user.username) + td(val.quote) + td(autton) + td(putton)))
				.appendTo($("#results"));
		});
		setHandlers();
	})
	.error(function(res) {
		spawnNotification('error', "Konnte Suchergebnisse nicht laden.");
	});
}

setHandlers();
