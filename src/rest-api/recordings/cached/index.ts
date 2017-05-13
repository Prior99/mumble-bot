import * as Express from "express";

import Delete from "./delete";
import Download from "./download";
import List from "./list";
import Play from "./play";
import Protect from "./protect";
import Save from "./save";
import Visualize from "./visualize";
import Websocket from "./websocket";

/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
export const RouteCached = function(bot) {
    const router = Express.Router();

    (router as any).ws("/websocket", Websocket(bot));
    router.get("/:id/visualize", Visualize(bot));
    router.post("/:id/save", Save(bot));
    router.post("/:id/protect", Protect(bot));
    router.post("/:id/play", Play(bot));
    router.get("/", List(bot));
    router.get("/:id/download", Download(bot));
    router.delete("/:id", Delete(bot));

    return router;
};
