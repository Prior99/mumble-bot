import * as Winston from "winston";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";
import { AuthorizedApiEndpoint } from "../../types";

/**
 * This view handles the deleting of cached records.
 */
export const Delete: AuthorizedApiEndpoint = (bot: Bot) => ({ params }, res) => {
    if (bot.removeCachedAudioById(parseInt(params.id))) {
        return okay(res);
    }
    return internalError(res);
};
