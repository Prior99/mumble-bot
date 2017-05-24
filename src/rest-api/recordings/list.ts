import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listRecordings } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { Bot } from "../..";
import { okay, internalError } from "../utils";

/**
 * List all records.
 */
export const List: AuthorizedApiEndpoint = (bot: Bot) => async ({ query }, res) => {
    try {
        const since = query.since ? new Date(query.since) : undefined;
        const recordings = await listRecordings(since, bot.database);
        return okay(res, { recordings });
    }
    catch (err) {
        Winston.error("Error listing records", err);
        return internalError(res);
    }
};
