/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAdd = require('./add');
var viewRemove = require('./remove');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/add', viewAdd(bot));
	router.use('/remove', viewRemove(bot));

	return router;
};
