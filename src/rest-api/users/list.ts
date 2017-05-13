import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listUsers } from "../../database";
import { ApiEndpoint } from "../types";
import { Bot } from "../..";
import { internalError } from "../utils";
/**
 * Returns a list of users.
 */
export const UsersList: ApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const users = await listUsers(bot.database);
        res.send({
            users
        });
    }
    catch (err) {
        Winston.error("Error fetching list of users", err);
        return internalError(res);
    }
};
