import $ from "jquery";
import * as spawnNotification from "../notification";
import CryptoJS from "crypto-js";

global.jQuery = $;
require("bootstrap-validator");

$("#form-register").validator({
	delay : 100
});
$("#form-register").validator("validate");
$("#register-submit").click((e) => {
	e.preventDefault();
	const email = encodeURIComponent($("#register-email").val());
	const username = encodeURIComponent($("#register-username").val());
	const password = encodeURIComponent(CryptoJS.SHA256($("#register-password").val()));
	const identifier = encodeURIComponent($("#register-identifier").val());
	const steamid = encodeURIComponent($("#register-steamid").val());
	const minecraft = encodeURIComponent($("#register-minecraft").val());
	$.ajax("/api/users/register?email=" + email +
		"&username=" + username +
		"&password=" + password +
		"&identifier=" + identifier +
		"&steamusername=" + steamid +
		"&minecraft=" + minecraft)
	.done((response) => {
		if(response.okay) {
			spawnNotification("success",
				"Die Anmeldung kann nun <a href='/' class='alert-link'>hier erfolgen</a>.", 0, true
			);
		}
		else {
			spawnNotification("error",
				"Konnte nicht registrieren." +
				" Bitte alle Werte nochmals überprüfen oder gegebenenfallls einen Administrator kontaktieren."
			);
		}
	});
});
