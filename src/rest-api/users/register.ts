import * as Winston from "winston";
import { getUserById, registerUser } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { Bot } from "../..";
import { internalError, conflict, okay } from "../utils";

/**
 * Grants all permissions to the user with the id 1. (The first registered user is admin).
 */
async function grantAll(bot: Bot) {
    try {
        const user = await getUserById(1, bot.database);
        bot.permissions.grantAllPermissions(null, user);
    }
    catch (err) {
        Winston.error("Error when granting all permissions to user with id 0.", err);
    }
}

/**
 * Register a new user on the server.
 */
export const Register: AuthorizedApiEndpoint = (bot: Bot) => async ({ body }, res) => {
    const { email, username, password } = body;
    try {
        const id = await registerUser({ email, username, password }, bot.database);
        Winston.debug("verbose", `A new user registered: ${username}`);
        if (id === 1) {
            Winston.debug("verbose", `Granted all permissions to user '${username}'`);
            grantAll(bot);
        }
        okay(res, { id });
    }
    catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return conflict(res, "Username already taken.");
        }
        Winston.error("Error registering new user: ", err);
        return internalError(res);
    }
};
