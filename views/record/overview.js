var $ = require("jquery");

require("./userbarchart");
require("./userpiechart");
require("./timechart");

$("#random").click(function() {
	$.ajax("/api/record/random");
});
