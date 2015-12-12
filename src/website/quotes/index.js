/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewDefault from "../default";
import * as viewAddQuote from "./add";
import * as viewQuoteHome from "./home";
import * as viewListQuotes from "./list";

/*
 * Code
 */
const pages = [{
	url : "/quotes/",
	name : "Info",
	icon : "info"
}, {
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
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RouteQuotes = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/add", viewAddQuote(bot));
	router.get("/list", viewListQuotes(bot));
	router.get("/", viewQuoteHome(bot));

	return router;
};

export default RouteQuotes;
