import * as Winston from "winston";
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { rename } from "async-file";
import * as HTTP from "http-status-codes";
import { addRecording, giveUserMoney } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, okay, badRequest, notFound } from "../../utils";

const moneyPerSave = 200;

/**
 * Api endpoint for saving a record.
 */
export const Save: AuthorizedApiEndpoint = (bot: Bot) => async ({ params, body, user }, res) => {
    const { quote, labels } = body;

    const id = parseInt(params.id);

    if (!quote || !labels) {
        return badRequest(res, "Missing arguments");
    }

    const sound = bot.getCachedAudioById(id);

    if (!sound) {
        return notFound(res);
    }

    try {
        await mkdirp(bot.options.paths.recordings);
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
    try {
        const newId = await addRecording(
            quote, sound.user, sound.date, labels, sound.duration, user.id, bot.database
        );
        try {
            await giveUserMoney(user, moneyPerSave, bot.database);
            await rename(sound.file, `${bot.options.paths.recordings}/${newId}`);
            await rename(sound.file + ".png", `${bot.options.paths.visualizations}/${newId}.png`);
            if (bot.removeCachedAudio(sound)) {
                Winston.log("verbose", `${user.username} added new record #${newId}`);
                return okay(res);
            }
            Winston.error("Could not remove element from array of cached audios.");
            return internalError(res);
        }
        catch (err) {
            Winston.error("Could not rename new record file.", err);
            return internalError(res);
        }
    }
    catch (err) {
        Winston.error("Could not add record to database.", err);
        return internalError(res);
    }
};
