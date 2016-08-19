import Express from "express";
import HTTPCodes from "../httpcodes";

import ViewTree from "./channeltree";
import ViewLog from "./log";

import RouteUsers from "./users";
import RouteSounds from "./sounds";
import RouteRecord from "./record";
import RouteStats from "./stats";

/**
 * Routes all requests related to the api in the /api/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteAPI = function(bot) {
	/**
	 * <b>Async</b> Performs the login of a user for this session by query parameters.
	 * @param {object} req - Express' request object.
	 * @param {object} res - The response object from express to answer to in case of failure.
	 * @param {VoidCallback} next - The next handler from express to call.
	 * @return {undefined}
	 */
	const loginByQueryString = async function(req, res, next) {
		try {
			const okay = await bot.database.checkLoginData(req.query.username, req.query.password);
			if(okay) {
				try {
					const user = await bot.database.getUserByUsername(req.query.username);
					const has = await bot.permissions.hasPermission(user, "login");
					if(has) {
						req.session.user = user;
						next();
					}
					else {
						res.status(HTTPCodes.invalidRequest).send({
							okay : false,
							reason : "no_login"
						});
					}
				}
				catch(err) {
					Winston.error("Error fetching user.", err);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
				}
			}
			else {
				res.status(HTTPCodes.invalidRequest).send({
					okay : false,
					reason : "no_login"
				});
			}
		}
		catch(err) {
			Winston.error("Error checking whether user exists", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	};

	const router = Express.Router();
	router.use("/users", RouteUsers(bot));
	router.use((req, res, next) => {
		if(req.session.user) {
			next();
		}
		else {
			loginByQueryString(req, res, next);
		}
	});
	router.use("/tree", ViewTree(bot));
	router.use("/sounds", RouteSounds(bot));
	router.use("/record", RouteRecord(bot));
	router.use("/stats", RouteStats(bot));
	router.use("/log", ViewLog(bot));

	return router;
};

export default RouteAPI;
