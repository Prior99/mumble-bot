/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAvailable = require('./usernameavailable');
/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();
	router.use('/usernameAvailable', viewAvailable(bot));
	return router;
};
