import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecordingPlaybackCountPerUser } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, okay } from "../../utils";

/**
 * Statistics view for playbacks per user.
 */
export const PlaybacksPerUser: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const spoken = await getRecordingPlaybackCountPerUser(bot.database);
        return okay(res, spoken);
    }
    catch (err) {
        Winston.error("Could not get playbacks of records by user.", err);
        return internalError(res);
    }
};
