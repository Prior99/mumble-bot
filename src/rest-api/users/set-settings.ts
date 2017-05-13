import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { setSetting } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { Bot } from "../..";
import { internalError, okay } from "../utils";

/**
 * Apply the settings from the api callback to the database and reload the session.
 */
export const SetSettings: AuthorizedApiEndpoint = (bot: Bot) => async ({ body, user }, res) => {
    const settings = [];
    const { record } = body;
    if (record) {
        settings.push({ key: "record", val: record });
    }
    try {
        const promises = settings.map(setting => setSetting(user, setting.key, setting.val, bot.database));
        await Promise.all(promises);
        return okay(res);
    }
    catch (err) {
        Winston.error("An error occured while saving settings for user " + user.username, err);
        return internalError(res);
    }
};;
