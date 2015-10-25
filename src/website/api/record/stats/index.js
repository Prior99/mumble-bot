/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewPerUser = require('./peruser');
var viewPerTime = require('./pertime');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/peruser', viewPerUser(bot));
	router.use('/pertime', viewPerTime(bot));

	return router;
};
