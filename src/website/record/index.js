/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewCurrentCached from "./cached";
import * as viewSave from "./save";
import * as viewStored from "./stored";
import * as viewLabels from "./labels";
import * as viewEdit from "./edit";
import * as viewOverview from "./overview";
import * as viewDialogs from "./dialogs.js";
import * as viewCreateDialog from "./createDialog.js";

/*
 * Code
 */
const pages = [{
	url : "/record/",
	name : "Übersicht",
	icon : "info"
}, {
	url : "/record/stored/",
	name : "Gespeicherte Aufnahmen",
	icon : "microphone"
}, {
	url : "/record/cached/",
	name : "Aufnahme Speichern",
	icon : "save"
}, {
	url : "/record/labels/",
	name : "Tags",
	icon : "tags"
}, {
	url : "/record/dialogs/",
	name: "Gespeicherte Dialoge",
	icon : "comments"
}, {
	url : "/record/create_dialog/",
	name: "Dialog erstellen",
	icon : "comments-o"
}];
const RouteRecord = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/cached", viewCurrentCached(bot));
	router.get("/save", viewSave(bot));
	router.get("/labels", viewLabels(bot));
	router.get("/edit", viewEdit(bot));
	router.get("/stored", viewStored(bot));
	router.get("/dialogs", viewDialogs(bot));
	router.get("/create_dialog", viewCreateDialog(bot));
	router.get("/", viewOverview(bot));

	return router;
};

export default RouteRecord;
