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
var viewDefault = require('../default');

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
	router.use('/playlist', viewDefault("music/playlist"));
	router.use('/status', viewDefault("music/status"));
	router.use('/upload', viewDefault("music/upload"));
	router.use('/songs', viewDefault("music/songs"));
	router.get('/', viewDefault("music/home"));

	return router;
};
