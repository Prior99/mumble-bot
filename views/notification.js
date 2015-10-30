var $ = require("jquery");

var spawnNotification = function(type, text, timeout, permanent) {
	if(!timeout) {
		timeout = 2000;
	}
	var elem;
	if(type === 'error') {
		elem = $($('#notification-error-template').html());
	}
	else if(type === 'success') {
		elem = $($('#notification-success-template').html());
	}
	else {
		console.error("Unknown notification type: '" + type + "'");
	}
	if(permanent) {
		elem.find('button').remove();
	}
	elem.append(text);
	$('#alerts').append(elem);
	if(timeout > 0 && type === 'success' && !permanent) {
		setTimeout(function() {
			elem.fadeOut();
		}, timeout);
	}
};

module.exports = spawnNotification;
