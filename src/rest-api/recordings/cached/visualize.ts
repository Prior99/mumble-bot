import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { createReadStream, writeFile, exists } from "async-file";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { badRequest, notFound, internalError } from "../../utils";

const maxRetries = 5;

/**
 * Api endpoint for the visualization of a cached audio
 */
export const Visualize: AuthorizedApiEndpoint = (bot: Bot) => async ({ params }, res) => {
    const id = parseInt(params.id);

    const sound = bot.getCachedAudioById(id);

    if (!sound) {
        return notFound(res, "Could not find cached audio with specified id.");
    }
    const fileName = `${sound.file}.png`;
    const trySend = async (retries: number) => {
        if (!await exists(fileName)) {
            if (retries === maxRetries) {
                return notFound(res);
            }
            setTimeout(() => trySend(retries + 1), 500);
            return;
        }
        try {
            res.status(HTTP.OK);
            createReadStream(fileName).on("error", (err) => {
                Winston.error(`Error sending visualization of ${sound.file} to client.`, err);
                return internalError(res);
            }).pipe(res);
        }
        catch (err) {
            Winston.error("Error occured during request of sound visualization.", err);
            return internalError(res);
        }
    };

    await trySend(0);
};
