import * as Express from "express";

import ViewList from "./list";
import ViewHome from "./home";
import ViewProfile from "./profile";
import ViewPermissions from "./permissions";
import ViewSettings from "./settings";
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
	router.get("/list", ViewList(bot));
	router.get("/settings", ViewSettings(bot));
	router.get("/profile/:username", ViewProfile(bot));
	router.get("/permissions/:username", ViewPermissions(bot));
	router.get("/", ViewHome(bot));

	return router;
};

export default RouteUsers;
