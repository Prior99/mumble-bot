/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewPlayCached = require('./playcached');
var viewSave = require('./save');
var viewPlay = require('./play');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/save', viewSave(bot));
	router.use('/play', viewPlay(bot));
	router.use('/playcached', viewPlayCached(bot));

	return router;
};
