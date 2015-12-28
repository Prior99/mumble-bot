import * as Express from "express";

import ViewDefault from "../default";

const pages = [{
	url : "/",
	name : "Play",
	icon : "play"
}];

/**
 * Routes all requests related to stuff in the /spotify/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSpotify = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/", ViewDefault("spotify/play"));

	return router;
};

export default RouteSpotify;
