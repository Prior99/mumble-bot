/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAdd = require('./add');
var viewPlay = require('./play');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/add', viewAdd(bot, router));
	router.use('/play', viewPlay(bot));

	return router;
};
