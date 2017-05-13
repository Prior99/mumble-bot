import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import FFMpeg from "fluent-ffmpeg";
import * as FS from "fs";
import { PassThrough as PassThroughStream } from "stream";
import { getRecording, forkRecording } from "../../database";

const audioFreq = 48000;

/**
 * This view is responsible for forking records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Fork = (bot) => async (req, res) => {
    const id = +req.body.id;
    const quote = req.body.quote;
    const actions = JSON.parse(req.body.actions);
    const overwrite = JSON.parse(req.body.overwrite);
    Winston.verbose(`${req.user.username} is forking record #${id}`);
    let newId, record, duration;
    try {
        // Calculate new duration
        record = await getRecording(id, bot.database);
        duration = record.duration;
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
            req.user,
            duration,
            bot.database
        );
    }
    catch (err) {
        Winston.error("Error occured while metadata on fork of record: ", err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send({ reason: "internal_error" });
        return;
    }

    const crop = (begin, end) => new Promise((resolve, reject) => {
        const transcoder = FFMpeg(`sounds/recorded/${id}`)
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
        res.status(HTTP.OK).send({});
    }
    catch (err) {
        Winston.error("Error occured while processing fork on record: ", err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send({ reason: "internal_error" });
    }
};
