/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewPlayCached = require('./playcached');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/playcached', viewPlayCached(bot));

	return router;
};
