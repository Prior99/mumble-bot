import * as Express from "express";
import { Bot } from "../../..";

import { PlaybacksPerUser } from "./playback-per-user";
import { PerTime } from "./per-time";
import { PerUser } from "./per-user";

/**
 * Routes all requests related to the recording statistics api.
 */
export const Recordings = (bot: Bot) => {
    const router = Express.Router();

    router.get("/per-user", PerUser(bot));
    router.get("/per-time", PerTime(bot));
    router.get("/playback-per-User", PlaybacksPerUser(bot));

    return router;
};
