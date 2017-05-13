import * as Express from "express";
import { ApiRoute } from "../types";
import { Bot } from "../..";

import { Online } from "./online";
import { Spoken } from "./spoken";
import { Recordings } from "./recordings";

/**
 * Routes all requests related to the stats api.
 */
export const Stats: ApiRoute = (bot: Bot) => {
    const router = Express.Router();

    router.get("/online", Online(bot));
    router.use("/spoken", Spoken(bot));
    router.use("/recordings", Recordings(bot));

    return router;
};
