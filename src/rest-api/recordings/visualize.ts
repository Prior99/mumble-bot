import * as Winston from "winston";
import { createReadStream, writeFile, exists } from "async-file";
import * as HTTP from "http-status-codes";
import { Bot } from "../..";
import { internalError, notFound } from "../utils";
import { AuthorizedApiEndpoint } from "../types";

const maxRetries = 5;

/**
 * This view handles the downloading of visualizations of the records.
 */
export const Visualize: AuthorizedApiEndpoint = (bot: Bot) => async ({ params }, res) => {
    const id = parseInt(params.id);

    const dirName = bot.options.paths.visualizations;
    const fileName = `${dirName}/${id}.png`;

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
            createReadStream(fileName).pipe(res);
        }
        catch (err) {
            Winston.error("Error occured during request of sound visualization.", err);
            return internalError(res);
        }
    };

    await trySend(0);
};
