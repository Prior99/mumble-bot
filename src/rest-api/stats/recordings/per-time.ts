import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecordingCountByDays } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, okay } from "../../utils";

/**
 * This api endpoint returns the statistics for the records per time.
 */
export const PerTime: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const spoken = await getRecordingCountByDays(bot.database);
        return okay(res, { spoken });
    }
    catch (err) {
        Winston.error("Could not get record count by days.", err);
        return internalError(res);
    }
};
