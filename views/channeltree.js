var $ = require("jquery");


function displayChannel(elem, channel) {
	var el = $("<li class='list-group-item'><b><i class='fa fa-home'></i> " + channel.name + "</b></li>");
	var sub;
	if(channel.users.length > 0 || channel.children.length > 0) {
		sub = $("<ul class='list-group'></ul>").appendTo(el);
	}
	if(channel.users.length > 0) {
		for(var i in channel.users) {
			var user = channel.users[i];
			sub.append("<li class='list-group-item'><i class='fa fa-user'></i> " + user + "</li>");
		}
	}
	if(channel.children.length > 0) {
		for(var i in channel.children) {
			var child = channel.children[i];
			displayChannel(sub, child);
		}
	}
	el.appendTo(elem);
}

$.getJSON("/api/tree", function(data) {
	displayChannel($("#tree"), data);
});
