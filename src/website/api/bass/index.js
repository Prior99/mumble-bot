import Express from "express";

import ViewAddEffects from "./addeffect";
import ViewEffects from "./effects";
import ViewPlay from "./play";

/**
 * Bass API related endpoints are routed by this class.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteBass = function(bot) {
	const router = Express.Router();

	router.use("/addEffect", ViewAddEffects(bot));
	router.use("/effects", ViewEffects(bot));
	router.use("/play", ViewPlay(bot));

	return router;
};

export default RouteBass;
