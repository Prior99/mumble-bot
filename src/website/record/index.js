/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewCurrentCached = require("./cached");
var viewSave = require("./save");
var viewStored = require("./stored");
var viewLabels = require("./labels");
var viewEdit = require("./edit");
var viewOverview = require("./overview");
var viewDialogs = require("./dialogs.js");
var viewCreateDialog = require("./createDialog.js");

/*
 * Code
 */
var pages = [{
	url : "/record/",
	name : "Übersicht",
	icon : "info"
},{
	url : "/record/stored/",
	name : "Gespeicherte Aufnahmen",
	icon : "microphone"
},{
	url : "/record/cached/",
	name : "Aufnahme Speichern",
	icon : "save"
},{
	url : "/record/labels/",
	name : "Tags",
	icon : "tags"
},{
	url : "/record/dialogs/",
	name: "Gespeicherte Dialoge",
	icon : "comments"
},{
	url : "/record/create_dialog/",
	name: "Dialog erstellen",
	icon : "comments-o"
}];
var RouteRecord = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/cached', viewCurrentCached(bot));
	router.get('/save', viewSave(bot));
	router.get('/labels', viewLabels(bot));
	router.get('/edit', viewEdit(bot));
	router.get('/stored', viewStored(bot));
	router.get('/dialogs', viewDialogs(bot));
	router.get('/create_dialog', viewCreateDialog(bot));
	router.get('/', viewOverview(bot));

	return router;
};

module.exports = RouteRecord;
