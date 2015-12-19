import Express from "express";

import ViewCurrentCached from "./cached";
import ViewSave from "./save";
import ViewStored from "./stored";
import ViewLabels from "./labels";
import ViewEdit from "./edit";
import ViewOverview from "./overview";
import ViewDialogs from "./dialogs.js";
import ViewCreateDialog from "./createDialog.js";

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
	router.get("/cached", ViewCurrentCached(bot));
	router.get("/save", ViewSave(bot));
	router.get("/labels", ViewLabels(bot));
	router.get("/edit", ViewEdit(bot));
	router.get("/stored", ViewStored(bot));
	router.get("/dialogs", ViewDialogs(bot));
	router.get("/create_dialog", ViewCreateDialog(bot));
	router.get("/", ViewOverview(bot));

	return router;
};

export default RouteRecord;
