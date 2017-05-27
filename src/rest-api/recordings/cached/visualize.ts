import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import * as FS from "fs";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { badRequest, notFound, internalError } from "../../utils";

/**
 * Api endpoint for the visualization of a cached audio
 */
export const Visualize: AuthorizedApiEndpoint = (bot: Bot) => ({ params }, res) => {
    const id = parseInt(params.id);
    const sound = bot.getCachedAudioById(id);
    if (sound) {
        res.status(HTTP.OK);
        FS.createReadStream(`${sound.file}.png`).on("error", (err) => {
            Winston.error(`Error sending visualization of ${sound.file} to client.`, err);
            return internalError(res);
        }).pipe(res);
        return;
    }
    return notFound(res, "Could not find cached audio with specified id.");
};
