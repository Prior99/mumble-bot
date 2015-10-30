var $ = require("jquery");

$("#speak").click(function() {
	$.ajax("/api/quotes/speak");
});
