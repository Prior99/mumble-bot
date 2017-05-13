import * as Express from "express";

import { Play } from "./play";
import { Download } from "./download";
import { AddLabel } from "./add-label";
import { Edit } from "./edit";
import { List } from "./list";
import { Get } from "./get";
import { Visualized } from "./visualize";
import { Fork } from "./fork";
import { RouteCached } from "./cached";
import { RouteDialogs } from "./dialog";
/**
 * Router for all API callbacks related to /api/record/.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
export const RouteRecordings = function(bot) {
    const router = Express.Router();

    router.use("/cached", RouteCached(bot));
    router.use("/dialog", RouteDialogs(bot));

    router.get("/", List(bot));
    router.get("/:id", Get(bot));
    router.get("/:id/play", Play(bot));
    router.get("/:id/download", Download(bot));
    router.post("/:id/addlabel", AddLabel(bot));
    router.post("/:id/edit", Edit(bot));
    router.get("/:id/visualize", Visualized(bot));
    router.post("/:id/fork", Fork(bot));

    return router;
};
