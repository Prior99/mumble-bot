var $ = require("jquery");
var spawnNotification = require("../notification");
var CryptoJS = require("crypto-js");

global.jQuery = $;
require("bootstrap-validator");

$('#login-submit').click(function(e) {
	e.preventDefault();
	var username = encodeURIComponent($('#login-username').val());
	var password = encodeURIComponent(CryptoJS.SHA256($('#login-password').val()));
	$.ajax("/api/users/login?username=" + username +
		"&password=" + password)
	.done(function(response) {
		if(response.okay) {
			window.location.reload();
		}
		else {
			if(response.reason === "internal_error") {
				spawnNotification('error', "Ein interner Fehler ist aufgetreten.");
			}
			else if(response.reason === "unknown_username_or_password") {
				spawnNotification('error', "Anmeldung nicht erfolgreich. Bitte nochmal versuchen.");
			}
			else if(response.reason === "insufficient_permission") {
				spawnNotification('error', "Anmeldung konnte nicht erfolgen, Account muss durch Admin freigeschaltet werden.");
			}
		}
	});
});
