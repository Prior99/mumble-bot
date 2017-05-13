import * as Winston from "winston";
import * as FS from "async-file";
import * as HTTP from "http-status-codes";
import { addRecording, giveUserMoney } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, okay, badRequest } from "../../utils";

const moneyPerSave = 200;

/**
 * Api endpoint for saving a record.
 */
export const Save: ApiEndpoint = (bot: Bot) => async ({ body, user }, res) => {
    const { id, quote, labels } = body;

    if (!id || !quote || !labels) {
        return badRequest(res, "Missing arguments");
    }

    const sound = bot.getCachedAudioById(id);

    try {
        FS.mkdir("sounds/recorded");
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
    try {
        const id = await addRecording(
            quote, sound.user, sound.date, labels, sound.duration, user.id, bot.database
        );
        try {
            await giveUserMoney(user, moneyPerSave, bot.database);
            await FS.rename(sound.file, `sounds/recorded/${id}`);
            await FS.rename(sound.file + ".png", `sounds/visualized/${id}.png`);
            if (bot.removeCachedAudio(sound)) {
                Winston.log("verbose", `${user.username} added new record #${id}`);
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