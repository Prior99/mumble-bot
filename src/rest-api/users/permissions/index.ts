import * as Express from "express";
import { Bot } from "../../..";

import { Grant } from "./grant";
import { ListForUser } from "./list-for-user";
import { Revoke } from "./revoke";

/**
 * Routes all requests related to the permission api.
 */
export const Permissions = (bot: Bot) => {
    const router = Express.Router();

    router.post("/revoke", Revoke(bot));
    router.get("/:id", ListForUser(bot));
    router.post("/grant", Grant(bot));

    return router;
};
