import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { Bot } from "../../..";
import { okay, internalError } from "../../utils";
import { AuthorizedApiEndpoint } from "../../types";

/**
 * Api endpoint for portecting a cached record.
 */
export const Protect: AuthorizedApiEndpoint = (bot: Bot) => ({ params }, res) => {
    const id = parseInt(params.id);
    if (bot.protectCachedAudio(id)) {
        return okay(res);
    }
    return internalError(res);
};
