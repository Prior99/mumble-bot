import Express from "express";

import Play from "./play";
import Download from "./download";
import AddLabel from "./add-label";
import Edit from "./edit";
import Random from "./random";
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

    router.use("/play", Play(bot));
    router.use("/download", Download(bot));
    router.use("/addlabel", AddLabel(bot));
    router.use("/edit", Edit(bot));
    router.use("/random", Random(bot));
    router.use("/list", List(bot));
    router.use("/get", Get(bot));
    router.use("/visualize", Visualize(bot));
    router.use("/fork", Fork(bot));

    return router;
};

export default RouteRecords;
