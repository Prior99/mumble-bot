import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { getRecording } from "../../database";
import { Bot } from "../..";
import { internalError, notFound } from "../utils";

/**
 * This api endpoint handles the downloading of records.
 */
export const Download = (bot: Bot) => async ({ params }, res) => {
    const id = parseInt(params.id);
    let record;
    try {
        record = await getRecording(id, bot.database);
    }
    catch (err) {
        Winston.error(
            "Error occured when trying to fetch data about record to download from database",
            id, err
        );
        return internalError(res);
    }
    res.setHeader(
        "Content-disposition", `attachment; filename='${record.quote}.mp3'`
    );
    const stream = FS.createReadStream(`${bot.options.paths.recordings}/${id}`)
        .on("error", (err) => {
            if (err.code === "ENOENT") {
                return notFound(res);
            }
            Winston.error("Error occured when trying to read record with id", id);
        })
        .on("readable", async () => {
            try {
                stream.pipe(res);
                return;
            }
            catch (err) {
                Winston.error(
                    "Error occured when trying to stream file to browser",
                    id, err
                );
            }
        });
};
