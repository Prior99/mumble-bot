import Express from "express";

import PerHour from "./per-hour";
import PerUser from "./per-user";
import PerWeekday from "./per-weekday";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteStats = function(bot) {
	const router = Express.Router();
	router.use("/perWeekday", PerWeekday(bot));
	router.use("/perUser", PerUser(bot));
	router.use("/perHour", PerHour(bot));

	return router;
};

export default RouteStats;
