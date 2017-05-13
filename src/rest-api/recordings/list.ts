import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listRecordings } from "../../database";
import { ApiEndpoint } from "../types";
import { Bot } from "../..";
import { okay, internalError } from "../utils";

/**
 * List all records.
 */
export const List: ApiEndpoint = (bot: Bot) => async ({ query }, res) => {
    try {
        const since = query.since ? new Date(query.since) : undefined;
        const records = await listRecordings(since, bot.database);
        return okay(res, { records })
    }
    catch (err) {
        Winston.error("Error listing records", err);
        return internalError(res);
    }
};
