import Express from "express";

import Add from "./add";
import Play from "./play";
import List from "./list";

/**
 * Routes all requests related to the sound api commands in the /api/sounds/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteSounds = function(bot) {
    const router = Express.Router();

    router.use("/add", Add(bot, router));
    router.use("/list", List(bot));
    router.use("/play", Play(bot));

    return router;
};

export default RouteSounds;
