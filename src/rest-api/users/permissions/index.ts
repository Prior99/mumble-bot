import * as Express from "express";
import { Bot } from "../../..";
import { authorized } from "../../utils";

import { Grant } from "./grant";
import { ListForUser } from "./list-for-user";
import { Revoke } from "./revoke";

/**
 * Routes all requests related to the permission api.
 */
export const Permissions = (bot: Bot) => {
    const router = Express.Router();

    router.post("/revoke", authorized(Revoke)(bot));
    router.get("/:id", authorized(ListForUser)(bot));
    router.post("/grant", authorized(Grant)(bot));

    return router;
};
