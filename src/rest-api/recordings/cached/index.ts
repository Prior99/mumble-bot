import { Router } from "express";
import { Bot } from "../../..";
import { ApiRoute } from "../../types";

import { Delete } from "./delete";
import { Download } from "./download";
import { List } from "./list";
import { Play } from "./play";
import { Protect } from "./protect";
import { Save } from "./save";
import { Visualize } from "./visualize";
import { Websocket } from "./websocket";

/**
 * Router for all API callbacks related to cached recordings.
 */
export const Cached: ApiRoute = (bot: Bot) => {
    const router = Router();

    (router as any).ws("/websocket", Websocket(bot));
    router.get("/", List(bot));
    router.get("/:id/visualize", Visualize(bot));
    router.post("/:id/save", Save(bot));
    router.post("/:id/protect", Protect(bot));
    router.post("/:id/play", Play(bot));
    router.get("/:id/download", Download(bot));
    router.delete("/:id", Delete(bot));

    return router;
};
