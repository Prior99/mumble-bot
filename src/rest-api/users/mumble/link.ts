import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { linkMumbleUser } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, forbidden, okay, badRequest } from "../../utils";

/**
 * Links a mumble user to a user.
 */
export const Link: AuthorizedApiEndpoint = (bot: Bot) => async ({ body, user }, res) => {
    if (!body.userId || !body.mumbleId) {
        return badRequest(res);
    }
    const mumbleId = parseInt(body.mumbleId);
    const userId = parseInt(body.userId);
    if (user.id === userId) {
        try {
            await linkMumbleUser(mumbleId, userId, bot.database);
            Winston.log("verbose", `${user.username} linked mumble user with id ${mumbleId} to user ${userId}`);
            return okay(res);
        }
        catch (err) {
            return internalError(res);
        }
    }
    else {
        return forbidden(res);
    }
};
