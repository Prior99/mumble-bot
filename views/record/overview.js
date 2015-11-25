var $ = require("jquery");

$("#random").click(function() {
	$.ajax("/api/record/random");
});
