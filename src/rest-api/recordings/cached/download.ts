import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, notFound } from "../../utils";

/**
 * This view handles the downloading of cached records.
 */
export const Download: ApiEndpoint = (bot: Bot) => ({ params }, res) => {
    const id: number = parseInt(params.id);
    const sound = bot.getCachedAudioById(id);
    const stream = FS.createReadStream(sound.file)
        .on("error", (err) => {
            if (err.code === "ENOENT") {
                return notFound(res, "No such cached record.");
            }
            Winston.error(`Error occured when trying to read cached record with id ${id}`);
            return internalError(res);
        })
        .on("readable", () => {
            try {
                res.status(HTTP.OK).setHeader(
                    "Content-disposition", `attachment; filename='cached_${id}.mp3'`
                );
                stream.pipe(res);
                return;
            }
            catch (err) {
                Winston.error("Error occured when trying to fetch data about record to download from database", id);
                return internalError(res);
            }
        });
}
