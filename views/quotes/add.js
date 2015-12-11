import $ from "jquery";
import * as spawnNotification from "../notification";

/**
 * Add a new element with the given quote and author to the table.
 * @param {string} quote - The quote to display in the element.
 * @param {string} author - The author to display in the element.
 * @return {jQuery} - The element that was created.
 */
const addElem = function(quote, author) {
	const elem = $("<tr><td>" +
		quote + "</td><td>" +
		author + "</td><td>" +
		"<i class=\"fa fa-cog fa-spin\"></i></td></tr>"
	)
	.appendTo("#results");
	return elem;
}

/**
 * Create the new quote on the server using the rest api and update the table afterwards or
 * display an error if it failed.
 * @param {string} quote - The quote.
 * @param {string} author - The author of the quote.
 * @return {undefined}
 */
const startQuote = function(quote, author) {
	const elem = addElem(quote, author);
	$.ajax("/api/quotes/add?quote=" + encodeURI(quote) + "&author=" + encodeURI(author))
	.done((response) => {
		if(response.okay) {
			elem.html("<td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-check\"></i></td>");
		}
		else {
			elem.html("<td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-remove\"></i></td>");
		}
	})
	.error(() => {
		elem.html("<td>" + quote + "</td><td>" + author + "</td><td><i class=\"fa fa-remove\"></i></td>");
		spawnNotification("error", "Sie verfügen nicht über die nötige Berechtigung, Zitate einzutragen.");
	});
}

$("#submit").click(() => {
	const quote = $("#quote").val();
	const author = $("#author").val();
	startQuote(quote, author);
});
