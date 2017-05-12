import * as Express from "express";

import Available from "./username-available";
import { Register } from "./register";
import Permissions from "./permission";
import SetSettings from "./set-settings";
import Mumble from "./mumble";
import List from "./list";
/**
 * Routes all requests related to the user api commands in the /api/users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
export const RouteUsers = function(bot) {
    const router = Express.Router();
    router.use("/usernameAvailable", Available(bot));
    router.use("/register", Register(bot));
    router.use("/permission", Permissions(bot));
    router.get("/setSettings", SetSettings(bot));
    router.use("/mumble", Mumble(bot));
    router.use("/list", List(bot))
    return router;
};
