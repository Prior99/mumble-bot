import Express from "express";

import Grant from "./grant";
import ListForUser from "./list-for-user";
import Revoke from "./revoke";

/**
 * Routes all requests related to the user api commands in the /api/users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteMumble = function(bot) {
	const router = Express.Router();
	router.use("/revoke", Revoke(bot));
	router.use("/listForUser", ListForUser(bot));
	router.use("/grant", Grant(bot));
	return router;
};

export default RouteMumble;
