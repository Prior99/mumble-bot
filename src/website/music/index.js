/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewDefault = require('../default');

/*
 * Code
 */
var pages = [{
	url : "/music/status/",
	name : "Status",
	icon : "headphones"
}, {
	url : "/music/playlist/",
	name : "Playlist",
	icon : "sort-amount-desc"
}, {
	url : "/music/songs/",
	name : "Songs",
	icon : "music"
}, {
	url : "/music/upload/",
	name : "Upload",
	icon : "upload"
}, {
	url : "/music/youtube/",
	name : "Youtube",
	icon : "youtube-square"
}];

/**
 * Routes all requests related to music in the /music/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteMusic = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.use('/playlist', viewDefault("music/playlist"));
	router.use('/status', viewDefault("music/status"));
	router.use('/upload', viewDefault("music/upload"));
	router.use('/songs', viewDefault("music/songs"));
	router.use('/youtube', viewDefault("music/youtube"));
	router.get('/', viewDefault("music/home"));

	return router;
};

module.exports = RouteMusic;
