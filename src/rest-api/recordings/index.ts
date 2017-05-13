import * as Express from "express";
import { ApiRoute } from "../types";
import { Bot } from "../..";

import { Cached } from "./cached";
import { Dialogs } from "./dialog";
import { Play } from "./play";
import { Download } from "./download";
import { AddLabel } from "./add-label";
import { Edit } from "./edit";
import { List } from "./list";
import { Get } from "./get";
import { Visualize } from "./visualize";
import { Fork } from "./fork";
/**
 * Router for all API callbacks related to recordings.
 */
export const Recordings: ApiRoute = (bot: Bot) => {
    const router = Express.Router();

    router.use("/cached", Cached(bot));
    router.use("/dialogs", Dialogs(bot));

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
