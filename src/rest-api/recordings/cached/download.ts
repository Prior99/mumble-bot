import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, notFound } from "../../utils";

/**
 * This view handles the downloading of cached records.
 */
export const Download: AuthorizedApiEndpoint = (bot: Bot) => ({ params }, res) => {
    const id = parseInt(params.id);
    const sound = bot.getCachedAudioById(id);
    res.setHeader(
        "Content-disposition", `attachment; filename='cached_${id}.mp3'`
    );
    const stream = FS.createReadStream(sound.file)
        .on("error", (err) => {
            if (err.code === "ENOENT") {
                return notFound(res, "No such cached record.");
            }
            Winston.error(`Error occured when trying to read cached record with id ${id}`);
        })
        .on("readable", () => {
            try {
                stream.pipe(res);
                return;
            }
            catch (err) {
                Winston.error("Error occured when trying to stream file to browser", id, err);
            }
        });
}
