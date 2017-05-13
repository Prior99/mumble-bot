import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserById } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { forbidden, okay, internalError, badRequest } from "../../utils";

/**
 * Revoke a permission from a specific user.
 */
export const Revoke: ApiEndpoint = (bot: Bot) => async ({ body, user: revokingUser }, res) => {
    const { permission } = body;
    try {
        const id = parseInt(body.id);
        const revokedUser = await getUserById(id, bot.database);
        if (revokedUser) {
            if (await bot.permissions.revokePermission(revokingUser, revokedUser, permission)) {
                return okay(res);
            }
            else {
                return forbidden(res);
            }
        }
        else {
            return badRequest(res);
        }
    }
    catch (err) {
        Winston.error("Could not fetch user while granting permission", err);
        return internalError(res);
    }
};