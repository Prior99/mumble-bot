import "./sidebar";
import "./tablesort";
import "bootstrap";
import $ from "jquery";
import * as spawnNotification from "./notification";

$("#nav-sign-out").click(() => {
	$.ajax("/api/users/logout").done((res) => window.location.reload());
})
$("#quiet-nav-btn").click(() => {
	$.ajax("/api/command?command=be%20quiet").done(
		(res) => spawnNotification("success", "Ausgabe von Sound sollte zeitnah aufhören.")
	)
	.error(() => spawnNotification("error", "Konnte Befehl nicht ausführen."));
})
