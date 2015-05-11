/*
 * Imports
 */

var Express = require('express');

/*
 * Code
 */

var RouteMusic = Express.Router();

RouteMusic.get('/', function() {
	res.send("Music homepage.");
});

module.exports = RouteMusic;
