import Express from "express";

import List from "./list";
import Play from "./play";
import Save from "./save";

/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteRecords = function(bot) {
    const router = Express.Router();

    router.use("/save", Save(bot));
    router.use("/play", Play(bot));
    router.use("/list", List(bot));

    return router;
};

export default RouteRecords;
