import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { Bot } from "../../..";
import { okay, notFound } from "../../utils";
import { AuthorizedApiEndpoint } from "../../types";

/**
 * Api endpoint for playing back a cached audio
 */
export const Play: AuthorizedApiEndpoint = (bot: Bot) => ({ params, user }, res) => {
    const id = parseInt(params.id);
    const cachedRecording = bot.getCachedAudioById(id);
    if (cachedRecording) {
        bot.playSound(cachedRecording.file, {
            type: "cached",
            cachedRecording,
            user
        });
        Winston.log("verbose", `${user.username} played back cached record #${id}`);
        return okay(res);
    }
    return notFound(res, "No such cached recording.");
};
