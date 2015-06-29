/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAdd = require('./add');
var viewSpeak = require('./speak');
/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();
	router.use('/add', viewAdd(bot));
	router.use('/speak', viewSpeak(bot));
	return router;
};
