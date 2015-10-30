var $ = require("jquery");

$("a.quote-btn").click(function() {
	$.ajax("/api/quotes/speak?id=" + $(this).attr("quoteId"));
});
