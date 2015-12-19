import Express from "express";

import ViewAdd from "./add";
import ViewRemove from "./remove";

/**
 * Router for all API callbacks related to /api/rss/
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouterRSS = function(bot) {
	const router = Express.Router();

	router.use("/add", ViewAdd(bot));
	router.use("/remove", ViewRemove(bot));

	return router;
};

export default RouterRSS;
