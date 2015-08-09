/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewPlay = require('./play');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/play', viewPlay(bot));

	return router;
};
