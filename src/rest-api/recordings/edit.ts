import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { updateRecording } from "../../database";
import { Bot } from "../..";
import { AuthorizedApiEndpoint } from "../types";
import { internalError, okay, missingArguments } from "../utils";

/**
 * This is the view for the api for editing records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Edit: AuthorizedApiEndpoint = (bot: Bot) => async ({ body, params, user }, res) => {
    const id = parseInt(params.id);
    const { quote, labels } = body;
    if (!quote || ! labels) {
        return missingArguments(res);
    }
    try {
        await updateRecording(id, quote, labels, bot.database);
        Winston.log("verbose", `${user.username} edited record #${id}`);
        return okay(res);
    }
    catch (err) {
        Winston.error("Could not edit record in database", err);
        return internalError(res);
    }
};
