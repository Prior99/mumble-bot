import Express from "express";

import ViewDefault from "../default";
import ViewSounds from "./sounds";

const pages = [{
	url : "/sounds/",
	name : "Sounds",
	icon : "volume-down"
}, {
	url : "/sounds/upload/",
	name : "Sound hochladen",
	icon : "upload"
}];
/**
 * Routes all requests related to quotes in the /quotes/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSounds = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/upload", ViewDefault("sounds/upload"));
	router.get("/", ViewSounds(bot));

	return router;
};

export default RouteSounds;
