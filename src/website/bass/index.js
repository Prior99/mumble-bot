import Express from "express";

import ViewDefault from "../default";
import ViewCreator from "./creator";

const pages = [{
	url : "/bass/effects/",
	name : "Effekte",
	icon : "puzzle-piece"
}, {
	url : "/bass/designer/",
	name : "Designer",
	icon : "magic"
}];

/**
 * Routes all requests related to bass in the /bass/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - The router for this section.
 */
const RouteBass = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.use("/designer", ViewCreator(bot));
	router.use("/effects", ViewDefault("bass/effects"));
	router.get("/", ViewCreator(bot));

	return router;
};

export default RouteBass;
