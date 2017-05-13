import * as Winston from "winston";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";
import { ApiEndpoint } from "../../types";

/**
 * This view handles the deleting of cached records.
 */
export const Delete: ApiEndpoint = (bot: Bot) => ({ params }, res) => {
    if (bot.removeCachedAudioById(params.id)) {
        return okay(res)
    }
    return internalError(res);
}
