import * as Express from "express";

import Link from "./link";
import ListFreeUsers from "./list-free-users";
import { ListLinkedUsers } from "./list-linked-users";

/**
 * Routes all requests related to the user api commands in the /api/users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const RouterUsers = function(bot) {
    const router = Express.Router();
    router.use("/link", Link(bot));
    router.use("/listFreeUsers", ListFreeUsers(bot));
    router.use("/listLinkedUsers", ListLinkedUsers(bot));
    return router;
};

export default RouterUsers;
