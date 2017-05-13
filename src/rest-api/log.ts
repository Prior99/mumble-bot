import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listLog } from "../database";
import { Bot } from "..";
import { ApiEndpoint } from "./types";
import { okay, forbidden, internalError } from "./utils";
/**
 * This handles the log endpoint with the list of the latest log entries when the needed permission is given.
 */
export const Log: ApiEndpoint = (bot: Bot) => async ({ user }, res) => {
    try {
        if (!await bot.permissions.hasPermission(user, "log")) {
            return forbidden(res);
        }
        return okay(res, {
            entries: await listLog(bot.database)
        });
    }
    catch (err) {
        Winston.error("Unabled to fetch logentries from database.", err);
        return internalError(res);
    }
};
