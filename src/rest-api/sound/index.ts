import * as Express from "express";
import * as Multer from "multer";
import { Bot } from "../..";
import { ApiRoute } from "../types";
import { authorized } from "../utils";

import { Add } from "./add";
import { Play } from "./play";
import { List } from "./list";

/**
 * Routes all requests related to the sound api.
 */
export const Sounds: ApiRoute = (bot: Bot) => {
    const router = Express.Router();
    router.use(Multer({
        dest: bot.options.website.tmp
    }).array());

    router.put("/", authorized(Add)(bot));
    router.get("/", authorized(List)(bot));
    router.get("/:id/play", authorized(Play)(bot));

    return router;
};
