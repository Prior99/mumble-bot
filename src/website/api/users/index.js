import Express from "express";

import ViewAvailable from "./usernameavailable";
import ViewSteam64Id from "./steam64id";
import ViewRegister from "./register";
import ViewLogin from "./login";
import ViewLogout from "./logout";
import ViewPermissions from "./permissions";
import ViewGrant from "./grantpermission";
import ViewRevoke from "./revokepermission";
import ViewLinkMumbleUser from "./linkmumbleuser";
import ViewSettings from "./settings";
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
	router.use("/usernameAvailable", ViewAvailable(bot));
	router.use("/steam64id", ViewSteam64Id());
	router.use("/register", ViewRegister(bot));
	router.use("/login", ViewLogin(bot));
	router.use("/logout", ViewLogout());
	router.use("/permissions", ViewPermissions(bot));
	router.get("/grantPermission", ViewGrant(bot));
	router.get("/revokePermission", ViewRevoke(bot));
	router.get("/linkMumbleUser", ViewLinkMumbleUser(bot));
	router.get("/settings", ViewSettings(bot));
	return router;
};

export default RouterUsers;
