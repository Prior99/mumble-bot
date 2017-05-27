import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { Bot } from "..";
import { AuthorizedApiEndpoint } from "./types";
import { okay, forbidden, internalError } from "./utils";
/**
 * This handles the log endpoint with the list of the latest log entries when the needed permission is given.
 */
export const ShutUp: AuthorizedApiEndpoint = (bot: Bot) => async ({ user }, res) => {
    try {
        if (!bot.permissions.hasPermission(user.id, "be-quiet")) {
            return forbidden(res);
        }
        bot.beQuiet();
        Winston.verbose(`${user.username} made the bot shut up.`);
        return okay(res);
    }
    catch (err) {
        Winston.error("Could not make the bot shut up.", err);
        return internalError(res);
    }
};
