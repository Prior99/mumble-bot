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

/*
 * Code
 */
var pages = [{
	url : "/quotes/add/",
	name : "Add Quote",
	icon : "quote-right"
}];

module.exports = function(bot) {
	var router = Express.Router();
	router.use(function(req, res, next) {
		res.locals.subpages = pages;
		next();
	});
	router.get('/add', viewAddQuote(bot));
	router.get('/', viewQuoteHome(bot));

	return router;
};
