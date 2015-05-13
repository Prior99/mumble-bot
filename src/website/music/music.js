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
var viewHome = require('./home');

/*
 * Code
 */
var pages = [{
	url : "/music/playlist/",
	name : "Playlist",
	icon : "list"
}, {
	url : "/music/status/",
	name : "Status",
	icon : "headphones"
}, {
	url : "/music/upload/",
	name : "Upload",
	icon : "open"
}, {
	url : "/music/songs/",
	name : "Songs",
	icon : "play"
}];

module.exports = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.use('/playlist', viewPlaylist(bot));
	router.use('/status', viewStatus(bot));
	router.use('/upload', viewUpload(bot));
	router.use('/songs', viewSongs(bot));
	router.get('/', viewHome(bot));

	return router;
};
