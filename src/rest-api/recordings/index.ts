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
import { authorized } from "../utils";
/**
 * Router for all API callbacks related to recordings.
 */
export const Recordings: ApiRoute = (bot: Bot) => {
    const router = Express.Router();

    router.use("/cached", Cached(bot));
    router.use("/dialogs", Dialogs(bot));

    router.get("/", authorized(List)(bot));
    router.get("/:id", authorized(Get)(bot));
    router.get("/:id/play", authorized(Play)(bot));
    router.get("/:id/download", authorized(Download)(bot));
    router.post("/:id/addlabel", authorized(AddLabel)(bot));
    router.post("/:id/edit", authorized(Edit)(bot));
    router.get("/:id/visualize", Visualize(bot));
    router.post("/:id/fork", authorized(Fork)(bot));

    return router;
};
