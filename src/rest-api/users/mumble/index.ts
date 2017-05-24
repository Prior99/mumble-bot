import * as Express from "express";
import { authorized } from "../../utils";

import { Link } from "./link";
import { ListFreeUsers } from "./list-free-users";
import { ListLinkedUsers } from "./list-linked-users";
import { Bot } from "../../../index";

/**
 * Routes all requests related to the mumble user api.
 */
export const Mumble = (bot: Bot) => {
    const router = Express.Router();

    router.post("/link", authorized(Link)(bot));
    router.get("/free-users", authorized(ListFreeUsers)(bot));
    router.get("/linked-users", authorized(ListLinkedUsers)(bot));

    return router;
};
