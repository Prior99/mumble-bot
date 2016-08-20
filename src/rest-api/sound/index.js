import Express from "express";

import ViewAdd from "./add";
import ViewPlay from "./play";

/**
 * Routes all requests related to the sound api commands in the /api/sounds/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSounds = function(bot) {
	const router = Express.Router();

	router.use("/add", ViewAdd(bot, router));
	router.use("/play", ViewPlay(bot));

	return router;
};

export default RouteSounds;
