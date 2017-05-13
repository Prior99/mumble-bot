import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { usedSound, getSound } from "../../database";
import { ApiEndpoint } from "../types";
import { Bot } from "../..";
import { okay, internalError } from "../utils";

/**
 * Api endpoint for playback endpoint of sound section.
 */
export const Play: ApiEndpoint = (bot: Bot) => async ({ params, user }, res) => {
    const id = parseInt(params.id);
    try {
        await usedSound(id, bot.database);
        const details = await getSound(id, bot.database);
        Winston.log("verbose", `${user.username} played sound #${id}`);
        bot.playSound(`sounds/uploaded/${id}`, {
            type: "sound",
            details,
            user
        });
        return okay(res);
    }
    catch (err) {
        Winston.error("Could not increase usages of sound", err);
        return internalError(res);
    }
};
