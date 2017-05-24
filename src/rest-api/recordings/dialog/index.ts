import * as Express from "express";
import { Bot } from "../../..";
import { ApiRoute } from "../../types";
import { authorized } from "../../utils";

import { List } from "./list";
import { Play } from "./play";
import { Save } from "./save";

/**
 * Router for all API callbacks related to dialogs.
 */
export const Dialogs: ApiRoute = (bot: Bot) => {
    const router = Express.Router();

    router.post("/save", authorized(Save)(bot));
    router.post("/:id/play", authorized(Play)(bot));
    router.get("/", authorized(List)(bot));

    return router;
};
