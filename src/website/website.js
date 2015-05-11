/*
 * Imports
 */

var Express = require('express');

/*
 * Routes
 */
var routeMusic = require('./music/music');

/*
 * Code
 */

var Website = function(bot) {
	this.app = express();
	this.bot = bot;
	this.app.use('/music', endpointMusic);
};

module.exports = Website;
