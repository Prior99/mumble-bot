import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { usedDialog, getDialogParts } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";

/**
 * Api endpoint for playing back saved dialogs.
 */
export const Play: ApiEndpoint = (bot: Bot) => async ({ params, user }, res) => {
    const id = parseInt(params.id);
    try {
        await usedDialog(id, bot.database);
        const parts = await getDialogParts(id, bot.database);
        // TODO: Hardcoded path.
        const files = parts.map(part => `sounds/recorded/${part}`);
        bot.output.playSounds(files, {
            type: "dialog",
            user
        });
        return okay(res);
    }
    catch (err) {
        Winston.error("Could not play dialog", err);
        return internalError(res);
    }
};
