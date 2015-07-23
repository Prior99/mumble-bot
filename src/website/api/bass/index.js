/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAddEffects = require('./addeffect');
var viewEffects = require('./effects');
var viewPlay = require('./play');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

		router.use('/addEffect', viewAddEffects(bot));
		router.use('/effects', viewEffects(bot));
		router.use('/play', viewPlay(bot));

	return router;
};
