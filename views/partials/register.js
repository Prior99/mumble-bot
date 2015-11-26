var $ = require("jquery");
var spawnNotification = require("../notification");
var CryptoJS = require("crypto-js");

global.jQuery = $;
require("bootstrap-validator");

$('#form-register').validator({
	delay : 100
});
$('#form-register').validator('validate');
$('#register-submit').click(function(e) {
	e.preventDefault();
	var email = encodeURIComponent($('#register-email').val());
	var username = encodeURIComponent($('#register-username').val());
	var password = encodeURIComponent(CryptoJS.SHA256($('#register-password').val()));
	var identifier = encodeURIComponent($('#register-identifier').val());
	var steamid = encodeURIComponent($('#register-steamid').val());
	var minecraft = encodeURIComponent($('#register-minecraft').val());
	$.ajax("/api/users/register?email=" + email +
		"&username=" + username +
		"&password=" + password +
		"&identifier=" + identifier +
		"&steamusername=" + steamid +
		"&minecraft=" + minecraft)
	.done(function(response) {
		if(response.okay) {
			spawnNotification('success', "Die Anmeldung kann nun <a href='/' class='alert-link'>hier erfolgen</a>.", 0, true);
		}
		else {
			spawnNotification('error', "Konnte nicht registrieren. Bitte alle Werte nochmals überprüfen oder gegebenenfallls einen Administrator kontaktieren.");
		}
	});
});
