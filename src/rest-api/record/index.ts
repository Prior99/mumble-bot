import Express from "express";

import Play from "./play";
import Download from "./download";
import AddLabel from "./add-label";
import Edit from "./edit";
import List from "./list";
import Get from "./get";
import Visualize from "./visualize";
import Fork from "./fork";
import Cached from "./cached";
import Dialog from "./dialog";
/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouteRecords = function(bot) {
    const router = Express.Router();

    router.use("/cached", Cached(bot));
    router.use("/dialog", Dialog(bot));

    router.get("/", List(bot));
    router.get("/:id", Get(bot));
    router.get("/:id/play", Play(bot));
    router.get("/:id/download", Download(bot));
    router.post("/:id/addlabel", AddLabel(bot));
    router.post("/:id/edit", Edit(bot));
    router.get("/:id/visualize", Visualize(bot));
    router.post("/:id/fork", Fork(bot));

    return router;
};

export default RouteRecords;
