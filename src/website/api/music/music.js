/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAdd = require('./add');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/add', viewAdd(bot));

	return router;
};
