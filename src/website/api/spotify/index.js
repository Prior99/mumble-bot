import Express from "express";

import ViewPlay from "./play";

const RouteSpotify = function(bot) {
	const router = Express.Router();
	router.use("/play", ViewPlay(bot));
	return router;
};

export default RouteSpotify;
