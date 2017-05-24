import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getSpokenPerUser } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, okay } from "../../utils";

/**
 * Api endpoint for statistics about speech per user.
 */
export const PerUser: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const spoken = await getSpokenPerUser(bot.database);
        return okay(res, spoken);
    }
    catch (err) {
        Winston.error("Could not get amount of speech by user.", err);
        return internalError(res);
    }
};
