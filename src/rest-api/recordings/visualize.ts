import * as Winston from "winston";
import mkdirp = require("mkdirp-promise");
import { stat, createReadStream, writeFile } from "async-file";
import * as HTTP from "http-status-codes";
import { Bot } from "../..";
import { internalError } from "../utils";
import { AuthorizedApiEndpoint } from "../types";
import { visualizeAudioFile } from "../../visualizer";

/**
 * This view handles the downloading of visualizations of the records.
 */
export const Visualize: AuthorizedApiEndpoint = (bot: Bot) => async ({ params }, res) => {
    const id = parseInt(params.id);
    const sendFile = stream => {
        res.status(HTTP.OK);
        stream.pipe(res);
        return;
    };

    const dirName = bot.options.paths.visualizations;
    const soundFileName = `${bot.options.paths.recordings}/${id}`;
    const fileName = `${dirName}/${id}.png`;

    try {
        await mkdirp(dirName);
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
            throw e;
        }
    }
    let stream;
    try {
        await stat(fileName);
        stream = createReadStream(fileName);
        sendFile(stream);
    }
    catch (err) {
        if (err.code !== "ENOENT") {
            Winston.error("Error occured during request of sound visualization.", err);
            return internalError(res);
        }
        Winston.info(`Visualizing audio file "${soundFileName}" to "${fileName}".`);
        try {
            const buffer = await visualizeAudioFile(soundFileName);
            await writeFile(fileName, buffer);
            try {
                const stream = createReadStream(fileName);
                return sendFile(stream);
            }
            catch (err) {
                if (err.code === "ENOENT") {
                    Winston.error("Visualizer did not create a file.");
                } else {
                    Winston.error("Unknown error when accessing file from visualizer.", err);
                }
                return internalError(res);
            }
        }
        catch (err) {
            Winston.error("Error occured when viusalizing file.", err);
            return internalError(res);
        }
    }
};
