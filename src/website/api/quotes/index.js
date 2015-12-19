import Express from "express";

import ViewAdd from "./add";
import ViewSpeak from "./speak";

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
	router.use("/add", ViewAdd(bot));
	router.use("/speak", ViewSpeak(bot));
	return router;
};

export default RouteQuotes;
