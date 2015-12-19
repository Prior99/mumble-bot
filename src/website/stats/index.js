import * as Express from "express";

import ViewDefault from "../default";

const pages = [{
	url : "/stats/",
	name : "Statistiken",
	icon : "pie-chart"
}, {
	url : "/stats/recordsperuser/",
	name : "Aufnahmen/Benutzer",
	icon : "group"
}, {
	url : "/stats/recordspertime/",
	name : "Aufnahmen/Zeit",
	icon : "calendar"
}, {
	url : "/stats/recordplaybacksperuser/",
	name : "Wiedergaben/Benutzer",
	icon : "play"
}, {
	url : "/stats/onlineperuser/",
	name : "Online/Benutzer",
	icon : "bolt"
}, {
	url : "/stats/spokenperuser/",
	name : "Sprache/Benutzer",
	icon : "microphone"
}, {
	url : "/stats/spokenperhour/",
	name : "Sprache/Stunde",
	icon : "clock-o"
}, {
	url : "/stats/spokenperweekday/",
	name : "Sprache/Wochentag",
	icon : "calendar-times-o"
}];

/**
 * Routes all requests related to users in the /stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteStats = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/recordsperuser", ViewDefault("stats/recordsperuser"));
	router.get("/recordspertime", ViewDefault("stats/recordspertime"));
	router.get("/recordplaybacksperuser", ViewDefault("stats/recordplaybacksperuser"));
	router.get("/onlineperuser", ViewDefault("stats/onlineperuser"));
	router.get("/spokenperuser", ViewDefault("stats/spokenperuser"));
	router.get("/spokenperhour", ViewDefault("stats/spokenperhour"));
	router.get("/spokenperweekday", ViewDefault("stats/spokenperweekday"));
	router.get("/", ViewDefault("stats/"));

	return router;
};

export default RouteStats;
