import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import FFMpeg from "fluent-ffmpeg";
import * as FS from "fs";
import { PassThrough as PassThroughStream } from "stream";
import { getRecording, forkRecording } from "../../database";
import { Bot } from "../..";
import { missingArguments, internalError, okay } from "../utils";
import { AuthorizedApiEndpoint } from "../types/index";

const audioFreq = 48000;

/**
 * This api endpoint is responsible for forking records.
 */
export const Fork: AuthorizedApiEndpoint = (bot: Bot) => async ({ params, body, user }, res) => {
    const id = parseInt(params.id);
    const { quote, actions, overwrite } = body;
    if (!quote || !actions || !overwrite) {
        return missingArguments(res);
    }
    Winston.verbose(`${user.username} is forking record #${id}`);
    let newId;
    try {
        // Calculate new duration
        const record = await getRecording(id, bot.database);
        let { duration } = record;
        for (const action of actions) {
            if (action.action === "crop") {
                duration = action.end - action.begin;
            }
        }
        // Fork in the database
        newId = await forkRecording(
            record.user,
            new Date(),
            quote,
            id,
            overwrite,
            user.id,
            duration,
            bot.database
        );
    }
    catch (err) {
        Winston.error("Error occured while metadata on fork of record: ", err);
        return internalError(res);
    }

    const crop = (begin, end) => new Promise((resolve, reject) => {
        FFMpeg(`sounds/recorded/${id}`)
            .seekInput(begin)
            .duration(end - begin)
            .format("mp3")
            .audioCodec("libmp3lame")
            .on("error", (err) => reject(err))
            .save(`sounds/recorded/${newId}`)
            .on("end", () => resolve());
    });

    try {
        // Perform the actual modifications
        for (const action of actions) {
            if (action.action === "crop") {
                await crop(+action.begin, +action.end);
            }
        }
        return okay(res);
    }
    catch (err) {
        Winston.error("Error occured while processing fork on record: ", err);
        return internalError(res);
    }
};
