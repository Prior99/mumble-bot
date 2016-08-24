import Express from "express";

import PlaybackPerUser from "./playback-per-user";
import PerTime from "./per-time";
import PerUser from "./per-user";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteStats = function(bot) {
	const router = Express.Router();
	router.use("/perUser", PerUser(bot));
	router.use("/perTime", PerTime(bot));
	router.use("/playbackPerUser", PlaybackPerUser(bot));

	return router;
};

export default RouteStats;
