/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

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

	return router;
};
