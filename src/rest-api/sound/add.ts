import * as Winston from "winston";
import mkdirp = require("mkdirp-promise"); // tslint:disable-line
import { writeFile } from "async-file";
import * as HTTP from "http-status-codes";
import { addSound } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { internalError, okay } from "../utils";

/**
 * Api endpoint for playback endpoint of sound section.
 */
export const Add: AuthorizedApiEndpoint = (bot) => async ({ body }, res) => {
    try {
        await mkdirp(`${bot.options.paths.uploaded}`);
    }
    catch (e) {
        if (e.code !== "EEXIST") {
            throw e;
        }
    }
    try {
        const { name, data } = body;
        const id = await addSound(name, bot.database);
        Winston.log("verbose", `added new sound #${id}`);
        await writeFile(`${bot.options.paths.uploaded}/${id}`, Buffer.from(data, "base64"));
        return okay(res, { id });
    }
    catch (err) {
        Winston.error("Could not add sound to database", err);
        return internalError(res);
    }
};
