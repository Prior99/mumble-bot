import * as Winston from "winston";
import mkdirp = require("mkdirp-promise");
import { rename } from "async-file";
import * as HTTP from "http-status-codes";
import { addSound } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { internalError, okay } from "../utils";

/**
 * Api endpoint for playback endpoint of sound section.
 */
export const Add: AuthorizedApiEndpoint = (bot) => async ({ files }, res) => {
    try {
        await mkdirp(`${bot.options.paths.uploaded}`);
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
    const { upload } = files;
    try {
        const promises = upload.map(async (file) => {
            const id = await addSound(file.originalname, bot.database);
            Winston.log("verbose", `added new sound #${id}`);
            await rename(file.path, `${bot.options.paths.uploaded}/${id}`);
            return id;
        });
        const ids: number[] = await Promise.all(promises);
        return okay(res, { ids });
    }
    catch (err) {
        Winston.error("Could not add sound to database", err);
        return internalError(res);
    }
};
