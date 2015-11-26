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
	url : "/stats/",
	name : "Statistiken",
	icon : "pie-chart"
},{
	url : "/stats/recordsperuser/",
	name : "Aufnahmen/Benutzer",
	icon : "group"
},{
	url : "/stats/recordspertime/",
	name : "Aufnahmen/Zeit",
	icon : "calendar"
},{
	url : "/stats/recordplaybacksperuser/",
	name : "Wiedergaben/Benutzer",
	icon : "play"
},{
	url : "/stats/onlineperuser/",
	name : "Online/Benutzer",
	icon : "bolt"
},{
	url : "/stats/spokenperuser/",
	name : "Sprache/Benutzer",
	icon : "microphone"
},{
	url : "/stats/spokenperhour/",
	name : "Sprache/Stunde",
	icon : "clock-o"
},{
	url : "/stats/spokenperweekday/",
	name : "Sprache/Wochentag",
	icon : "calendar-times-o"
}];

var RouteStats = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/recordsperuser', viewDefault("stats/recordsperuser"));
	router.get('/recordspertime', viewDefault("stats/recordspertime"));
	router.get('/recordplaybacksperuser', viewDefault("stats/recordplaybacksperuser"));
	router.get('/onlineperuser', viewDefault("stats/onlineperuser"));
	router.get('/spokenperuser', viewDefault("stats/spokenperuser"));
	router.get('/spokenperhour', viewDefault("stats/spokenperhour"));
	router.get('/spokenperweekday', viewDefault("stats/spokenperweekday"));
	router.get('/', viewDefault("stats/"));

	return router;
};

module.exports = RouteStats;
