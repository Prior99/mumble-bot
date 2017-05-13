import * as Express from "express";
import { Bot } from "../..";

import { UsernameAvailable } from "./username-available";
import { Register } from "./register";
import { Permissions } from "./permission";
import { SetSettings } from "./set-settings";
import { Mumble } from "./mumble";
import { List } from "./list";

/**
 * Routes all requests related to the user api.
 */
export const RouteUsers = (bot: Bot) => {
    const router = Express.Router();

    router.use("/permission", Permissions(bot));
    router.use("/mumble", Mumble(bot));
    router.get("/username-available", UsernameAvailable(bot));
    router.post("/", Register(bot));
    router.get("/", List(bot))
    router.post("/set-settings", SetSettings(bot));

    return router;
};

