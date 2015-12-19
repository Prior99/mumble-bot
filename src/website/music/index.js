import Express from "express";

import ViewDefault from "../default";

const pages = [{
	url : "/music/status/",
	name : "Status",
	icon : "headphones"
}, {
	url : "/music/playlist/",
	name : "Playlist",
	icon : "sort-amount-desc"
}, {
	url : "/music/songs/",
	name : "Songs",
	icon : "music"
}, {
	url : "/music/upload/",
	name : "Upload",
	icon : "upload"
}, {
	url : "/music/youtube/",
	name : "Youtube",
	icon : "youtube-square"
}];

/**
 * Routes all requests related to music in the /music/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - The router for this section.
 */
const RouteMusic = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.use("/playlist", ViewDefault("music/playlist"));
	router.use("/status", ViewDefault("music/status"));
	router.use("/upload", ViewDefault("music/upload"));
	router.use("/songs", ViewDefault("music/songs"));
	router.use("/youtube", ViewDefault("music/youtube"));
	router.get("/", ViewDefault("music/home"));

	return router;
};

export default RouteMusic;
