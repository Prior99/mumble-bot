import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserByUsername } from "../../database";
import { ApiEndpoint } from "../types";
import { Bot } from "../..";
import { internalError, okay } from "../utils";

/**
 * Checks whether a username is available.
 */
export const UsernameAvailable: ApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const user = await getUserByUsername(req.body.username, bot.database);
        return okay(res, {
            available: !Boolean(user)
        });
    }
    catch (err) {
        Winston.error("Error checking whether username is available", err);
        return internalError(res);
    }
};
