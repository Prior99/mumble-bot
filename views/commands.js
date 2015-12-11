import $ from "jquery";

$(".execute-command").click(function(e) {
	e.preventDefault();
	const cmd = $(this).attr("cmdId");
	const arg = $(this).attr("argument");
	let string = "/api/command?command=" + cmd;
	if(arg) {
		string += "&argument=" + arg;
	}
	$.ajax(string);
});
