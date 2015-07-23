/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewDefault = require('../default');
var viewCreator = require('./creator');
/*
 * Code
 */
var pages = [{
	url : "/bass/effects/",
	name : "Effekte",
	icon : "puzzle-piece"
}, {
	url : "/bass/designer/",
	name : "Designer",
	icon : "magic"
}];

/**
 * Routes all requests related to bass in the /bass/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteBass = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.use('/designer', viewCreator(bot));
	router.use('/effects', viewDefault("bass/effects"));
	router.get('/', viewDefault("bass/designer"));

	return router;
};

module.exports = RouteBass;
