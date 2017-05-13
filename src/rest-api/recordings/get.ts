import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecording } from "../../database";
import { Bot } from "../..";
import { ApiEndpoint } from "../types";
import { okay, internalError } from "../utils";

/**
 * This api endpoint returns the details to one specific record.
 */
export const Get: ApiEndpoint = (bot: Bot) => async ({ params }, res) => {
    const id = parseInt(params.id);
    try {
        const record = await getRecording(id, bot.database);
        return okay(res, { record });
    }
    catch (err) {
        Winston.error("Error while getting record", err);
        return internalError(res);
    }
};
