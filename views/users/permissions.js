var $ = require("jquery");
var spawnNotification = require("../notification");

function revoke(checkbox, user) {
	$.ajax("/api/users/revokePermission?user=" + user + "&permission=" + checkbox.attr('permission'))
	.done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Die Berechtigung wurde erfolgreich entzogen!");
			checkbox.prop('checked', false);
		}
		else {
			spawnNotification('error', "Die Berechtigung konnte nicht entzogen werden!");
			checkbox.prop('checked', true);
		}
	});
}

function grant(checkbox, user) {
	$.ajax("/api/users/grantPermission?user=" + user + "&permission=" + checkbox.attr('permission'))
	.done(function(res) {
		if(res.okay) {
			spawnNotification('success', "Die Berechtigung wurde erfolgreich erteilt!");
			checkbox.prop('checked', true);
		}
		else {
			spawnNotification('error', "Die Berechtigung konnte nicht erteilt werden!");
			checkbox.prop('checked', false);
		}
	});
}

$(".perm-check").change(function(e) {
	e.preventDefault();
	e.stopPropagation();
	if(!$(this).attr('disabled')) {
		if(!this.checked) {
			revoke($(this), $(this).attr('user'));
		}
		else {
			grant($(this), $(this).attr('user'));
		}
	}
});
