/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewAddEffects from "./addeffect";
import * as viewEffects from "./effects";
import * as viewPlay from "./play";

/*
 * Code
 */

/**
 * Bass API related endpoints are routed by this class.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteBass = function(bot) {
	const router = Express.Router();

	router.use("/addEffect", viewAddEffects(bot));
	router.use("/effects", viewEffects(bot));
	router.use("/play", viewPlay(bot));

	return router;
};

export default RouteBass;
