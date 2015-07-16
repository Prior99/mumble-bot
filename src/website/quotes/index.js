/*
 * Imports
 */

var Express = require('express');

/*
 * Views
 */

var viewDefault = require('../default');
var viewAddQuote = require("./add");
var viewQuoteHome = require("./home");
var viewListQuotes = require("./list");

/*
 * Code
 */
var pages = [{
	url : "/quotes/",
	name : "Info",
	icon : "info"
},{
	url : "/quotes/add/",
	name : "Zitat hinzufügen",
	icon : "quote-right"
}, {
	url : "/quotes/list/",
	name : "Zitate anzeigen",
	icon : "database"
}];
/**
 * Routes all requests related to quotes in the /quotes/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var RouteQuotes = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/add', viewAddQuote(bot));
	router.get('/list', viewListQuotes(bot));
	router.get('/', viewQuoteHome(bot));

	return router;
};

module.exports = RouteQuotes;