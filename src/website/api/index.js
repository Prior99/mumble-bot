/*
 * Imports
 */

import * as Express from "express";
import * as HTTPCodes from "../httpcodes";

/*
 * Views
 */

import * as viewTree from "./channeltree";
import * as viewCommand from "./command";
import * as viewGoogleLookup from "./googlelookup";

/*
 * Routes
 */
import * as routeMusic from "./music";
import * as routeUsers from "./users";
import * as routeQuotes from "./quotes";
import * as routeBass from "./bass";
import * as routeSpeak from "./speak";
import * as routeSounds from "./sounds";
import * as routeRecord from "./record";
import * as routeRSS from "./rss";
import * as routeStats from "./stats";


/*
 * Code
 */

/**
 * Routes all requests related to the api in the /api/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteAPI = function(bot) {
	/**
	 * Performs the login of a user for this session by query parameters.
	 * @param {object} req - Express' request object.
	 * @param {object} res - The response object from express to answer to in case of failure.
	 * @param {VoidCallback} next - The next handler from express to call.
	 * @return {undefined}
	 */
	const loginByQueryString = function(req, res, next) {
		bot.database.checkLoginData(req.query.username, req.query.password, (err, okay) => {
			if(err) {
				Winston.error("Error checking whether user exists", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				if(okay) {
					bot.database.getUserByUsername(req.query.username, (err, user) => {
						if(err) {
							Winston.error("Error fetching user.", err);
							res.status(HTTPCodes.internalError).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							bot.permissions.hasPermission(user, "login", (has) =>{
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
							});
						}
					});
				}
				else {
					res.status(HTTPCodes.invalidRequest).send({
						okay : false,
						reason : "no_login"
					});
				}
			}
		});
	}

	const router = Express.Router();
	router.use("/users", routeUsers(bot));
	router.use((req, res, next) => {
		if(req.session.user) {
			next();
		}
		else {
			loginByQueryString(req, res, next);
		}
	});
	router.use("/music", routeMusic(bot));
	router.use("/tree", viewTree(bot));
	router.use("/command", viewCommand(bot));
	router.use("/quotes", routeQuotes(bot));
	router.use("/bass", routeBass(bot));
	router.use("/speak", routeSpeak(bot));
	router.use("/sounds", routeSounds(bot));
	router.use("/google", viewGoogleLookup(bot));
	router.use("/record", routeRecord(bot));
	router.use("/rss", routeRSS(bot));
	router.use("/stats", routeStats(bot));

	return router;
};

export default RouteAPI;
