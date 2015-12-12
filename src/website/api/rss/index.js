/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewAdd from "./add";
import * as viewRemove from "./remove";

/*
 * Code
 */

/**
 * Router for all API callbacks related to /api/rss/
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouterRSS = function(bot) {
	const router = Express.Router();

	router.use("/add", viewAdd(bot));
	router.use("/remove", viewRemove(bot));

	return router;
};

export default RouterRSS;
