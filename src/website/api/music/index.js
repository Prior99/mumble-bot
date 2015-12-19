import Express from "express";

import ViewAdd from "./add";
import ViewStatus from "./status";
import ViewPlaylist from "./playlist";
import ViewSongs from "./songs";
import ViewNext from "./next";
import ViewPlay from "./play";
import ViewPause from "./pause";
import ViewUpload from "./upload";
import ViewYoutube from "./youtube";

/**
 * Router for all API callbacks related to the music section.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteMusic = function(bot) {
	const router = Express.Router();

	router.use("/add", ViewAdd(bot));
	router.use("/status", ViewStatus(bot));
	router.use("/playlist", ViewPlaylist(bot));
	router.use("/songs", ViewSongs(bot));
	router.use("/next", ViewNext(bot));
	router.use("/play", ViewPlay(bot));
	router.use("/pause", ViewPause(bot));
	router.use("/upload", ViewUpload(bot, router));
	router.use("/youtube", ViewYoutube(bot, router));

	return router;
};

export default RouteMusic;
