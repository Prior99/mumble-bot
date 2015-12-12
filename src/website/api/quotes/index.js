/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewAdd from "./add";
import * as viewSpeak from "./speak";

/*
 * Code
 */

/**
 * Router for all API callbacks for the quotes section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteQuotes = function(bot) {
	const router = Express.Router();
	router.use("/add", viewAdd(bot));
	router.use("/speak", viewSpeak(bot));
	return router;
};

export default RouteQuotes;
