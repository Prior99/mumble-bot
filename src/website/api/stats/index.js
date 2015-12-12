/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewRecordsPerUser from "./recordsperuser";
import * as viewRecordsPerTime from "./recordspertime";
import * as viewSpokenPerHour from "./spokenperhour";
import * as viewSpokenPerUser from "./spokenperuser";
import * as viewSpokenPerWeekday from "./spokenperweekday";
import * as viewOnlinePerUser from "./onlineperuser";
import * as viewRecordPlaybacksPerUser from "./recordplaybacksperuser";

/*
 * Code
 */

/**
* Routes all requests related to the stats api commands in the /api/stats/ endpoint.
* @param {Bot} bot - Bot the webpage belongs to.
* @return {Router} - router for the current section.
*/
const RouteStats = function(bot) {
	const router = Express.Router();

	router.use("/recordsperuser", viewRecordsPerUser(bot));
	router.use("/recordspertime", viewRecordsPerTime(bot));
	router.use("/spokenperhour", viewSpokenPerHour(bot));
	router.use("/spokenperuser", viewSpokenPerUser(bot));
	router.use("/spokenperweekday", viewSpokenPerWeekday(bot));
	router.use("/onlineperuser", viewOnlinePerUser(bot));
	router.use("/recordplaybacksperuser", viewRecordPlaybacksPerUser(bot));

	return router;
};

export default RouteStats;
