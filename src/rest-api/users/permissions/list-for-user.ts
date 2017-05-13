import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserById } from "../../../database";
import { ApiEndpoint } from "../../types";
import { Bot } from "../../..";
import { internalError, badRequest, okay } from "../../utils";

/**
 * List the permissions for one user.
 */
export const ListForUser: ApiEndpoint = (bot: Bot) => async ({ body, user: listingUser }, res) => {
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
