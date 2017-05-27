import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listUsers } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { Bot } from "../..";
import { internalError, okay } from "../utils";
/**
 * Returns a list of users.
 */
export const List: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const users = await listUsers(bot.database);
        return okay(res, {
            users
        });
    }
    catch (err) {
        Winston.error("Error fetching list of users", err);
        return internalError(res);
    }
};
