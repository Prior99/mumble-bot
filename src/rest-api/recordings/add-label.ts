import * as Winston from "winston";
import { colorify } from "../../colorbystring";
import * as HTTP from "http-status-codes";
import { addRecordingLabel } from "../../database";
import { AuthorizedApiEndpoint } from "../types";
import { Bot } from "../..";
import { badRequest, okay, internalError } from "../utils";

/**
 * This endpoint handles adding labels to the database.
 */
export const AddLabel: AuthorizedApiEndpoint = (bot: Bot) => async ({ body, user }, res) => {
    const { name } = body;
    if (!name || name.trim().length === 0) {
        return badRequest(res);
    }
    try {
        const id = await addRecordingLabel(name, bot.database);
        Winston.log("verbose", `${user.username} added new label for records: "${name}"`);
        return okay(res, {
            color: colorify(name),
            id
        });
    }
    catch (err) {
        Winston.error("Unabled to add new label", err);
        return internalError(res);
    }
};
