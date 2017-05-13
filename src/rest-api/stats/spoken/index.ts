import * as Express from "express";
import { Bot } from "../../..";
import { ApiRoute } from "../../types";

import { PerHour } from "./per-hour";
import { PerUser } from "./per-user";
import { PerWeekday } from "./per-weekday";

/**
 * Routes all requests related to the spoken statistics api.
 */
export const Spoken: ApiRoute = (bot: Bot) => {
    const router = Express.Router();

    router.get("/per-weekday", PerWeekday(bot));
    router.get("/per-user", PerUser(bot));
    router.get("/per-hour", PerHour(bot));

    return router;
};
