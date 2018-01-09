import * as Express from "express";
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

    router.put("/", authorized(Add)(bot));

    return router;
};
