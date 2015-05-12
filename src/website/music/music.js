/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewPlaylist = require('./playlist');
var viewSongs = require('./songs');
var viewStatus = require('./status');
var viewUpload = require('./upload');

/*
 * Code
 */

module.exports = function(bot) {
	var router = Express.Router();

	router.use('/playlist', viewPlaylist(bot));
	router.use('/status', viewStatus(bot));
	router.use('/upload', viewUpload(bot));
	router.use('/songs', viewSongs(bot));

	router.get('/', function(req, res) {
		res.render('music/music');
	});

	return router;
};
