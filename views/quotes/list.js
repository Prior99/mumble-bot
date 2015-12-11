import $ from "jquery";

$("a.quote-btn").click((e) => {
	$.ajax("/api/quotes/speak?id=" + $(e.currentTarget).attr("quoteId"));
});
