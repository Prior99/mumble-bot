import $ from "jquery";

/**
 * Display a channel. This is a recursive function creating a tree with all channels and
 * users in them.
 * @param {jQuery} elem - The element in which to nest the subtree.
 * @param {object} channel - The channel to display.
 * @param {object} channel.name - Name of the channel.
 * @param {string[]} channel.users - The users currently in the channel.
 * @param {object[]} channel.children - All subchannels.
 * @return {undefined}
 */
const displayChannel = function(elem, channel) {
	const el = $("<li class='list-group-item'><b><i class='fa fa-home'></i> " + channel.name + "</b></li>");
	let sub;
	if(channel.users.length > 0 || channel.children.length > 0) {
		sub = $("<ul class='list-group'></ul>").appendTo(el);
	}
	if(channel.users.length > 0) {
		for(const user of channel.users) {
			sub.append("<li class='list-group-item'><i class='fa fa-user'></i> " + user + "</li>");
		}
	}
	if(channel.children.length > 0) {
		for(const child of channel.children) {
			displayChannel(sub, child);
		}
	}
	el.appendTo(elem);
}

$.getJSON("/api/tree", (data) => displayChannel($("#tree"), data));
