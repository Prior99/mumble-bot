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
var viewNext = require('./next');
var viewPlay = require('./play');
var viewPause = require('./pause');
var viewUpload = require('./upload');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

		router.use('/add', viewAdd(bot));
		router.use('/status', viewStatus(bot));
		router.use('/playlist', viewPlaylist(bot));
		router.use('/songs', viewSongs(bot));
		router.use('/next', viewNext(bot));
		router.use('/play', viewPlay(bot));
		router.use('/pause', viewPause(bot));
		router.use('/upload', viewUpload(bot, router));

	return router;
};
