import * as Express from "express";

import Online from "./online";
import Spoken from "./spoken";
import Record from "./record";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
export const RouteStats = function(bot) {
    const router = Express.Router();

    router.use("/online", Online(bot));
    router.use("/spoken", Spoken(bot));
    router.use("/record", Record(bot));

    return router;
};
