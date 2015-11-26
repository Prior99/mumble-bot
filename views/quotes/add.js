var $ = require("jquery");
var spawnNotification = require("../notification");

function addElem(quote, author) {
	var elem = $("<tr><td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-cog fa-spin\"></i></td></tr>").appendTo("#results");
	return elem;
}

function startQuote(quote, author) {
	var elem = addElem(quote, author);
	$.ajax("/api/quotes/add?quote=" + encodeURI(quote) + "&author=" + encodeURI(author))
	.done(function(response) {
		if(response.okay) {
			elem.html("<td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-check\"></i></td>");
		}
		else {
			elem.html("<td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-remove\"></i></td>");
		}
	})
	.error(function() {
		elem.html("<td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-remove\"></i></td>");
		spawnNotification('error', "Sie verfügen nicht über die nötige Berechtigung, Zitate einzutragen.");
	});
}

$("#submit").click(function() {
	var quote = $("#quote").val();
	var author = $("#author").val();
	startQuote(quote, author);
});
