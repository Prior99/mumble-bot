/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewList = require('./list');
var viewHome = require('./home');
var viewProfile = require('./profile');
var viewPermissions = require('./permissions');
var viewSettings = require('./settings');
/*
 * Code
 */
var pages = [{
	url : "/users/list/",
	name : "Benutzer Liste",
	icon : "users"
}];

/**
 * Routes all requests related to users in the /users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteUsers = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/list', viewList(bot));
	router.get('/settings', viewSettings(bot));
	router.get('/profile/:username', viewProfile(bot));
	router.get('/permissions/:username', viewPermissions(bot));
	router.get('/', viewHome(bot));

	return router;
};

module.exports = RouteUsers;
