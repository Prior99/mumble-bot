import * as Express from "express";

import ViewDefault from "../default";
import ViewAddQuote from "./add";
import ViewQuoteHome from "./home";
import ViewListQuotes from "./list";

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
 * @return {Router} - The router for this section.
 */
const RouteQuotes = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/add", ViewAddQuote(bot));
	router.get("/list", ViewListQuotes(bot));
	router.get("/", ViewQuoteHome(bot));

	return router;
};

export default RouteQuotes;
