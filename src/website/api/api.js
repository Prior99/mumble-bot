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
var routeMusic = require('./music/music');
var routeQuotes = require('./quotes/quotes');


/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/music', routeMusic(bot));
	router.use('/tree', viewTree(bot));
	router.use('/command', viewCommand(bot));
	router.use('/quotes', routeQuotes(bot));

	return router;
};
