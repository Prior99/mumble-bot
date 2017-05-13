import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getSpokenPerHour } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, okay } from "../../utils";

/**
 * Api endpoint for statistics about speech per hour.
 */
export const PerHour: ApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const arr = await getSpokenPerHour(bot.database);
        return okay(res, arr)
    }
    catch (err) {
        Winston.error("Could not get amount of speech by hour of the day.", err);
        return internalError(res);
    }
};;
