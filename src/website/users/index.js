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
/*
 * Code
 */
var pages = [{
	url : "/users/list/",
	name : "Benutzer Liste",
	icon : "users"
}];

module.exports = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/list', viewList(bot));
	router.get('/profile/:username', viewProfile(bot));
	router.get('/permissions/:username', viewPermissions(bot));
	router.get('/', viewHome(bot));

	return router;
};
