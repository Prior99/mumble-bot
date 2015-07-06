/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAvailable = require('./usernameavailable');
var viewSteam64Id = require('./steam64id');
/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();
	router.use('/usernameAvailable', viewAvailable(bot));
	router.use('/steam64id', viewSteam64Id());
	return router;
};
