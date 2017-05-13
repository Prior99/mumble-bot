import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getOnlinePerUser } from "../../database";
import { Bot } from "../..";
import { ApiEndpoint } from "../types";
import { okay, internalError } from "../utils";

/**
 * Statistics view for online time per user.
 */
export const Online: ApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const spoken = await getOnlinePerUser(bot.database);
        return okay(res, { spoken });
    }
    catch (err) {
        Winston.error("Could not get amount of online time by user.", err);
        return internalError(res);
    }
};
