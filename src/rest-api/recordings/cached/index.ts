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
import { authorized, authorizedWebsocket } from "../../utils";

/**
 * Router for all API callbacks related to cached recordings.
 */
export const Cached: ApiRoute = (bot: Bot) => {
    const router = Router();

    (router as any).ws("/websocket", authorizedWebsocket(Websocket)(bot));
    router.get("/:id/visualize", Visualize(bot));
    router.get("/:id/download", authorized(Download)(bot));

    return router;
};
