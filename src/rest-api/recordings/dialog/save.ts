import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { addDialog } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { okay, missingArguments, internalError } from "../../utils";

/**
 * Api endpoint for saving a new dialog.
 */
export const Save: ApiEndpoint = (bot: Bot) => async (req, res) => {
    const dialog = req.body;
    if (!dialog) {
        return missingArguments(res);
    }
    try {
        await addDialog(dialog, bot.database);
        return okay(res);
    }
    catch (err) {
        Winston.error("Error while saving dialog", err);
        return internalError(res);
    }
};
