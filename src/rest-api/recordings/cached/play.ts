import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { Bot } from "../../..";
import { okay, notFound } from "../../utils";
import { ApiEndpoint } from "../../types";

/**
 * Api endpoint for playing back a cached audio
 */
export const Play: ApiEndpoint = (bot: Bot) => ({ params, user }, res) => {
    const id = parseInt(params.id);
    const sound = bot.getCachedAudioById(id);
    if (sound) {
        bot.playSound(sound.file, {
            type: "cached",
            details: sound,
            user
        });
        Winston.log("verbose", `${user.username} played back cached record #${id}`);
        return okay(res);
    }
    return notFound(res, "No such cached recording.");
};
