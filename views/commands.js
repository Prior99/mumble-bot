var $ = require("jquery");

$(".execute-command").click(function(e) {
	e.preventDefault();
	var cmd = $(this).attr("cmdId");
	var arg = $(this).attr("argument");
	var string = "/api/command?command=" + cmd;
	if(arg) {
		string += "&argument=" + arg;
	}
	$.ajax(string);
});
