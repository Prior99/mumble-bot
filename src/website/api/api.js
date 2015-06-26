/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewTree = require('./channeltree');
var enterQuote = require('./quotes');

/*
 * Routes
 */
var routeMusic = require('./music/music');


/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/music', routeMusic(bot));
	router.use('/tree', viewTree(bot));
	router.use('/enterQuote', enterQuote(bot));

	return router;
};
