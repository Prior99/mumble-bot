/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewLookup = require('./lookup');
var viewSpeak = require('./speak');
/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();
	router.use('/lookup', viewLookup(bot));
	router.use('/speak', viewSpeak(bot));
	return router;
};
