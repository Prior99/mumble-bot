import Express from "express";

import ViewRecordsPerUser from "./recordsperuser";
import ViewRecordsPerTime from "./recordspertime";
import ViewSpokenPerHour from "./spokenperhour";
import ViewSpokenPerUser from "./spokenperuser";
import ViewSpokenPerWeekday from "./spokenperweekday";
import ViewOnlinePerUser from "./onlineperuser";
import ViewRecordPlaybacksPerUser from "./recordplaybacksperuser";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteStats = function(bot) {
	const router = Express.Router();

	router.use("/recordsperuser", ViewRecordsPerUser(bot));
	router.use("/recordspertime", ViewRecordsPerTime(bot));
	router.use("/spokenperhour", ViewSpokenPerHour(bot));
	router.use("/spokenperuser", ViewSpokenPerUser(bot));
	router.use("/spokenperweekday", ViewSpokenPerWeekday(bot));
	router.use("/onlineperuser", ViewOnlinePerUser(bot));
	router.use("/recordplaybacksperuser", ViewRecordPlaybacksPerUser(bot));

	return router;
};

export default RouteStats;
