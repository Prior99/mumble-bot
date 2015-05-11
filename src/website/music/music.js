/*
 * Imports
 */

var Express = require('express');

/*
 * Code
 */

var RouteMusic = express.router();

RouteMusic.get('/', function() {
	res.send("Music homepage.");
});

module.exports = WebsiteMusic;
