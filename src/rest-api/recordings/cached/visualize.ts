import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import * as FS from "fs";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { badRequest, notFound } from "../../utils";

/**
 * Api endpoint for the visualization of a cached audio
 */
export const Visualize: ApiEndpoint = (bot: Bot) => ({ params }, res) => {
    const id = parseInt(params.id);
    const sound = bot.getCachedAudioById(id);
    if (sound) {
        res.status(HTTP.OK);
        FS.createReadStream(`${sound.file}.png`).pipe(res);
        return;
    }
    return notFound(res, "Could not find cached audio with specified id.");
};
