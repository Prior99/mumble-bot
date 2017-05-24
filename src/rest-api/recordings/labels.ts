import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { Bot } from "../..";
import { listLabels } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { internalError, okay } from "../utils";

/**
 * Api endpoint for listing and creating labels.
 */
export const Labels: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const labels = await listLabels(bot.database);
        return okay(res, { labels });
    }
    catch (err) {
        Winston.error("Error listing labels", err);
        return internalError(res);
    }
};
