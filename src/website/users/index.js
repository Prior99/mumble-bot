/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewList from "./list";
import * as viewHome from "./home";
import * as viewProfile from "./profile";
import * as viewPermissions from "./permissions";
import * as viewSettings from "./settings";
/*
 * Code
 */
const pages = [{
	url : "/users/list/",
	name : "Benutzer Liste",
	icon : "users"
}];

/**
 * Routes all requests related to users in the /users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteUsers = function(bot) {
	const router = Express.Router();
	router.use((req, res, next) => {
		res.locals.subpages = pages;
		next();
	});
	router.get("/list", viewList(bot));
	router.get("/settings", viewSettings(bot));
	router.get("/profile/:username", viewProfile(bot));
	router.get("/permissions/:username", viewPermissions(bot));
	router.get("/", viewHome(bot));

	return router;
};

export default RouteUsers;
