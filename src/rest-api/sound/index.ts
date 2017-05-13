import * as Express from "express";
import * as Multer from "multer";
import { Bot } from "../..";
import { ApiRoute } from "../types";

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

    router.put("/", Add(bot));
    router.get("/", List(bot));
    router.get("/:id/play", Play(bot));

    return router;
};
