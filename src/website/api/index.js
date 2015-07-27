/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewTree = require('./channeltree');
var viewCommand = require('./command');

/*
 * Routes
 */
var routeMusic = require('./music');
var routeUsers = require('./users');
var routeQuotes = require('./quotes');
var routeBass = require('./bass');
var routeSpeak = require('./speak');
var routeSounds = require('./sounds');


/*
 * Code
 */

/**
 * Routes all requests related to the qpi in the /qpi/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteAPI = function(bot) {

	function loginByQueryString(req, res, next) {
		bot.database.checkLoginData(req.query.username, req.query.password, function(err, okay) {
			if(err) {
				Winston.error("Error checking whether user exists", err);
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				if(okay) {
					bot.database.getUserByUsername(req.query.username, function(err, user) {
						if(err) {
							Winston.error("Error fetching user.", err);
							res.status(500).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							bot.permissions.hasPermission(user, "login", function(has) {
								if(has) {
									req.session.user = user;
									next();
								}
								else {
									res.status(400).send({
										okay : false,
										reason : "no_login"
									});
								}
							});
						}
					});
				}
				else {
					res.status(400).send({
						okay : false,
						reason : "no_login"
					});
				}
			}
		});
	}

	var router = Express.Router();
	router.use('/users', routeUsers(bot));
	router.use(function(req, res, next) {
		if(req.session.user) {
			next();
		}
		else {
			loginByQueryString(req, res, next);
		}
	});
	router.use('/music', routeMusic(bot));
	router.use('/tree', viewTree(bot));
	router.use('/command', viewCommand(bot));
	router.use('/quotes', routeQuotes(bot));
	router.use('/bass', routeBass(bot));
	router.use('/speak', routeSpeak(bot));
	router.use('/sounds', routeSounds(bot));

	return router;
};

module.exports = RouteAPI;
