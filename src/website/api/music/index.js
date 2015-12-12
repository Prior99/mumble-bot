/*
 * Imports
 */

import * as Express from "express";

/*
 * Views
 */

import * as viewAdd from "./add";
import * as viewStatus from "./status";
import * as viewPlaylist from "./playlist";
import * as viewSongs from "./songs";
import * as viewNext from "./next";
import * as viewPlay from "./play";
import * as viewPause from "./pause";
import * as viewUpload from "./upload";
import * as viewYoutube from "./youtube";

/*
 * Code
 */

/**
 * Router for all API callbacks related to the music section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteMusic = function(bot) {
	const router = Express.Router();

	router.use("/add", viewAdd(bot));
	router.use("/status", viewStatus(bot));
	router.use("/playlist", viewPlaylist(bot));
	router.use("/songs", viewSongs(bot));
	router.use("/next", viewNext(bot));
	router.use("/play", viewPlay(bot));
	router.use("/pause", viewPause(bot));
	router.use("/upload", viewUpload(bot, router));
	router.use("/youtube", viewYoutube(bot, router));

	return router;
};

export default RouteMusic;
