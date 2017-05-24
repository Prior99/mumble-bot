import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listSounds } from "../../database";
import { Bot } from "../..";
import { AuthorizedApiEndpoint } from "../types";
import { okay, internalError } from "../utils";

/**
 * Returns a list of all sounds.
 */
export const List: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const sounds = await listSounds(bot.database);
        return okay(res, {
            sounds
        });
    }
    catch (err) {
        Winston.error("Could not get list of sounds", err);
        return internalError(res);
    }
};
