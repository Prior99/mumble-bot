/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewAvailable from "./usernameavailable";
import * as viewSteam64Id from "./steam64id";
import * as viewRegister from "./register";
import * as viewLogin from "./login";
import * as viewLogout from "./logout";
import * as viewPermissions from "./permissions";
import * as viewGrant from "./grantpermission";
import * as viewRevoke from "./revokepermission";
import * as viewLinkMumbleUser from "./linkmumbleuser";
import * as viewSettings from "./settings";
/*
 * Code
 */

/**
 * Routes all requests related to the user api commands in the /api/users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouterUsers = function(bot) {
	const router = Express.Router();
	router.use("/usernameAvailable", viewAvailable(bot));
	router.use("/steam64id", viewSteam64Id());
	router.use("/register", viewRegister(bot));
	router.use("/login", viewLogin(bot));
	router.use("/logout", viewLogout());
	router.use("/permissions", viewPermissions(bot));
	router.get("/grantPermission", viewGrant(bot));
	router.get("/revokePermission", viewRevoke(bot));
	router.get("/linkMumbleUser", viewLinkMumbleUser(bot));
	router.get("/settings", viewSettings(bot));
	return router;
};

export default RouterUsers;
