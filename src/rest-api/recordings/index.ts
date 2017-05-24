import * as Express from "express";
import { ApiRoute } from "../types";
import { Bot } from "../..";

import { Cached } from "./cached";
import { Dialogs } from "./dialog";
import { Play } from "./play";
import { Download } from "./download";
import { AddLabel } from "./add-label";
import { Labels } from "./labels";
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
    router.post("/labels", authorized(AddLabel)(bot));
    router.get("/labels", authorized(Labels)(bot));
    router.get("/:id", authorized(Get)(bot));
    router.post("/:id", authorized(Edit)(bot));
    router.post("/:id/play", authorized(Play)(bot));
    router.get("/:id/download", authorized(Download)(bot));
    router.get("/:id/visualize", Visualize(bot));
    router.post("/:id/fork", authorized(Fork)(bot));

    return router;
};
