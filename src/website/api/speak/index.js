/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewLookup from "./lookup";
import * as viewSpeak from "./speak";
/*
 * Code
 */

/**
 * Routes all requests related to the speak api commands in the /api/speak/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSpeak = function(bot) {
	const router = Express.Router();
	router.use("/lookup", viewLookup(bot));
	router.use("/speak", viewSpeak(bot));
	return router;
};

export default RouteSpeak;
