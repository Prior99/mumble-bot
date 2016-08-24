import Express from "express";

import RecordsPerUser from "./recordsperuser";
import RecordsPerTime from "./recordspertime";
import SpokenPerHour from "./spokenperhour";
import SpokenPerUser from "./spokenperuser";
import SpokenPerWeekday from "./spokenperweekday";
import OnlinePerUser from "./onlineperuser";
import RecordPlaybacksPerUser from "./recordplaybacksperuser";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteStats = function(bot) {
	const router = Express.Router();

	router.use("/recordsperuser", RecordsPerUser(bot));
	router.use("/recordspertime", RecordsPerTime(bot));
	router.use("/spokenperhour", SpokenPerHour(bot));
	router.use("/spokenperuser", SpokenPerUser(bot));
	router.use("/spokenperweekday", SpokenPerWeekday(bot));
	router.use("/onlineperuser", OnlinePerUser(bot));
	router.use("/recordplaybacksperuser", RecordPlaybacksPerUser(bot));

	return router;
};

export default RouteStats;
