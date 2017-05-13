import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserById } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { okay, forbidden, internalError, badRequest } from "../../utils";

/**
 * Grant a permission to a specific user.
 */
export const Grant: AuthorizedApiEndpoint = (bot: Bot) => async ({ body, user: grantingUser }, res) => {
    const { permission } = body;
    const id = parseInt(body.id);
    try {
        const grantedUser = await getUserById(id, bot.database);
        if (grantedUser) {
            if (await bot.permissions.grantPermission(grantingUser, grantedUser, permission)) {
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
