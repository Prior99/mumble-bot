import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listDialogs } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";

/**
 * Api endpoint for list of dialogs.
 */
export const List: ApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const dialogs = await listDialogs(bot.database);
        return okay(res, { dialogs });
    }
    catch (err) {
        Winston.error("Error listing dialogs", err);
        return internalError(res);
    }
};
