/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewCurrentCached = require('./cached');
var viewSave = require('./save');
var viewStored = require("./stored");
var viewLabels = require("./labels");
var viewEdit = require("./edit");

/*
 * Code
 */
var pages = [{
	url : "/record/",
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
	router.get('/', viewStored(bot));

	return router;
};

module.exports = RouteRecord;
