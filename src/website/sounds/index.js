/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */
var viewDefault = require('../default');
var viewSounds = require('./sounds');

/*
 * Code
 */
var pages = [{
	url : "/sounds/",
	name : "Sounds",
	icon : "volume-down"
},{
	url : "/sounds/upload/",
	name : "Sound hochladen",
	icon : "upload"
}];
/**
 * Routes all requests related to quotes in the /quotes/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteSounds = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/upload', viewDefault("sounds/upload"));
	router.get('/', viewSounds(bot));

	return router;
};

module.exports = RouteSounds;
