import $ from "jquery";

const spawnNotification = function(type, text, timeout, permanent) {
	const twoSeconds = 2000;
	if(!timeout) {
		timeout = twoSeconds;
	}
	let elem;
	if(type === "error") {
		elem = $($("#notification-error-template").html());
	}
	else if(type === "success") {
		elem = $($("#notification-success-template").html());
	}
	else {
		throw new Error("Unknown notification type: '" + type + "'");
	}
	if(permanent) {
		elem.find("button").remove();
	}
	elem.append(text);
	$("#alerts").append(elem);
	if(timeout > 0 && type === "success" && !permanent) {
		setTimeout(() => elem.fadeOut(), timeout);
	}
};

export default spawnNotification;
