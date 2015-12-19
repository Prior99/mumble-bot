import Express from "express";

import ViewLookup from "./lookup";
import ViewSpeak from "./speak";

/**
 * Routes all requests related to the speak api commands in the /api/speak/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSpeak = function(bot) {
	const router = Express.Router();
	router.use("/lookup", ViewLookup(bot));
	router.use("/speak", ViewSpeak(bot));
	return router;
};

export default RouteSpeak;
