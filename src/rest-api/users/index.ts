import * as Express from "express";
import { Bot } from "../..";
import { authorized } from "../utils";

import { UsernameAvailable } from "./username-available";
import { Register } from "./register";
import { Permissions } from "./permissions";
import { SetSettings } from "./set-settings";
import { Mumble } from "./mumble";
import { List } from "./list";

/**
 * Routes all requests related to the user api.
 */
export const Users = (bot: Bot) => {
    const router = Express.Router();

    router.use("/permission", authorized(Permissions)(bot));
    router.use("/mumble", authorized(Mumble)(bot));
    router.get("/username-available", authorized(UsernameAvailable)(bot));
    router.post("/set-settings", authorized(SetSettings)(bot));

    return router;
};
