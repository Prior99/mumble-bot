import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserById } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, badRequest, okay } from "../../utils";

/**
 * List the permissions for one user.
 */
export const ListForUser: AuthorizedApiEndpoint = (bot: Bot) => async ({ body, user: listingUser }, res) => {
    try {
        const id = parseInt(body.id);
        const listedUser = await getUserById(id, bot.database);
        if (listedUser) {
            const permissions = await bot.permissions.listPermissionsForUser(listingUser, listedUser);
            return okay(res, { permissions });
        }
        else {
            return badRequest(res);
        }
    }
    catch (err) {
        return internalError(res);
    }
};
