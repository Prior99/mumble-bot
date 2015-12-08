import $ from "jquery";
import * as spawnNotification from "../notification";

/**
 * Revoke the permission from some user.
 * @param {JQuery} checkbox - The checkbox element which will be altered after a successfull ajax
 *                            request and from which the the permission will be read from.
 * @param {Number} user - The id of the user to revoke the permission from.
 * @return {undefined}
 */
const revoke = function(checkbox, user) {
	$.ajax("/api/users/revokePermission?user=" + user + "&permission=" + checkbox.attr("permission"))
	.done((res) => {
		if(res.okay) {
			spawnNotification("success", "Die Berechtigung wurde erfolgreich entzogen!");
			checkbox.prop("checked", false);
		}
		else {
			spawnNotification("error", "Die Berechtigung konnte nicht entzogen werden!");
			checkbox.prop("checked", true);
		}
	});
}

/**
 * Grant a permission to some user.
 * @param {JQuery} checkbox - The checkbox element which will be altered after a successfull ajax
 *                            request and from which the the permission will be read from.
 * @param {Number} user - The id of the user to grant the permission to.
 * @return {undefined}
 */
const grant = function(checkbox, user) {
	$.ajax("/api/users/grantPermission?user=" + user + "&permission=" + checkbox.attr("permission"))
	.done((res) => {
		if(res.okay) {
			spawnNotification("success", "Die Berechtigung wurde erfolgreich erteilt!");
			checkbox.prop("checked", true);
		}
		else {
			spawnNotification("error", "Die Berechtigung konnte nicht erteilt werden!");
			checkbox.prop("checked", false);
		}
	});
}

$(".perm-check").change((e) => {
	e.preventDefault();
	e.stopPropagation();
	if(!$(e.currentTarget).attr("disabled")) {
		if(!e.currentTarget.checked) {
			revoke($(e.currentTarget), $(e.currentTarget).attr("user"));
		}
		else {
			grant($(e.currentTarget), $(e.currentTarget).attr("user"));
		}
	}
});
