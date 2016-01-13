import "./sidebar";
import "./tablesort";
import "bootstrap";
import $ from "jquery";
import spawnNotification from "./notification";

$("#nav-sign-out").click(() => {
	$.ajax("/api/users/logout").done((res) => window.location.reload());
});
$("#quiet-nav-btn").click(() => {
	$.ajax("/api/command?command=be%20quiet").done(
		(res) => spawnNotification("success", "Ausgabe von Sound sollte zeitnah aufhören.")
	)
	.error(() => spawnNotification("error", "Konnte Befehl nicht ausführen."));
});

require("../node_modules/tablesorter/dist/js/jquery.tablesorter.min.js");
require("../node_modules/tablesorter/dist/js/jquery.tablesorter.widgets.min.js");
