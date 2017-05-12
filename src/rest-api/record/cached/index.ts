import Express from "express";

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
const RouteCached = function(bot) {
    const router = Express.Router();

    router.ws("/websocket", Websocket(bot));
    router.use("/visualize", Visualize(bot));
    router.use("/save", Save(bot));
    router.use("/protect", Protect(bot));
    router.use("/play", Play(bot));
    router.use("/list", List(bot));
    router.use("/download", Download(bot));
    router.use("/delete", Delete(bot));

    return router;
};

export default RouteCached;
