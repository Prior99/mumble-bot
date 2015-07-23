/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewTree = require('./channeltree');
var viewCommand = require('./command');

/*
 * Routes
 */
var routeMusic = require('./music');
var routeUsers = require('./users');
var routeQuotes = require('./quotes');
var routeBass = require('./bass');


/*
 * Code
 */

/**
 * Routes all requests related to the qpi in the /qpi/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteAPI = function(bot) {
	var router = Express.Router();
	router.use('/users', routeUsers(bot));
	router.use(function(req, res, next) {
		if(req.session.user) {
			next();
		}
	});
	router.use('/music', routeMusic(bot));
	router.use('/tree', viewTree(bot));
	router.use('/command', viewCommand(bot));
	router.use('/quotes', routeQuotes(bot));
	router.use('/bass', routeBass(bot));

	return router;
};

module.exports = RouteAPI;
