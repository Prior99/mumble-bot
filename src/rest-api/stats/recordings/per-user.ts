import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecordingCountByUsers } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";

/**
 * Api endpoint for statistics about speech per hour.
 */
export const PerUser: ApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const arr = await getRecordingCountByUsers(bot.database);
        return okay(res, arr);
    }
    catch (err) {
        Winston.error("Could not get record count by users.", err);
        return internalError(res);
    }
};
