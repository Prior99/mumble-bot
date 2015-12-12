/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewAdd from "./add";
import * as viewPlay from "./play";

/*
 * Code
 */

/**
 * Routes all requests related to the sound api commands in the /api/sounds/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSounds = function(bot) {
	const router = Express.Router();

	router.use("/add", viewAdd(bot, router));
	router.use("/play", viewPlay(bot));

	return router;
};

export default RouteSounds;
