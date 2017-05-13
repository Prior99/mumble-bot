import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { getRecording } from "../../database";
import { Bot } from "../..";
import { internalError, notFound } from "../utils";

/**
 * This api endpoint handles the downloading of records.
 */
export const Download = (bot: Bot) => ({ params }, res) => {
    const id = parseInt(params.id);
    const stream = FS.createReadStream(`sounds/recorded/${id}`);
    stream.on("error", (err) => {
        if (err.code === "ENOENT") {
            return notFound(res);
        }
        else {
            Winston.error("Error occured when trying to read record with id", id);
            return internalError(res);
        }
    }).on("readable", async () => {
        try {
            const record = await getRecording(id, bot.database);
            res.status(HTTP.OK).setHeader(
                "Content-disposition", `attachment; filename='${record.quote}.mp3'`
            );
            stream.pipe(res);
            return;
        }
        catch (err) {
            Winston.error(
                "Error occured when trying to fetch data about record to download from database",
                id
            );
            return internalError(res);
        }
    });
};
