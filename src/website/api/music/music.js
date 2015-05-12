/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewAdd = require('./add');
var viewStatus = require('./status');
var viewPlaylist = require('./playlist');
var viewSongs = require('./songs');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

		router.use('/add', viewAdd(bot));
		router.use('/status', viewStatus(bot));
		router.use('/playlist', viewPlaylist(bot));
		router.use('/songs', viewSongs(bot));

	return router;
};
