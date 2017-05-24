import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getLinkedMumbleUsersOfUser, getUserById } from "../../../database";
import { AuthorizedApiEndpoint } from "../../types/index";
import { Bot } from "../../../index";
import { notFound, okay, internalError } from "../../utils";

export const ListLinkedUsers: AuthorizedApiEndpoint = (bot: Bot) => async ({ body }, res) => {
    try {
        const id = parseInt(body.id);
        const user = await getUserById(id, bot.database); // Reload user from database
        if (!user) {
            return notFound(res);
        }
        if (user) {
            try {
                const linkedUsers = await getLinkedMumbleUsersOfUser(id, bot.database);
                const users = linkedUsers.map(linkedUser => bot.mumble.userById(linkedUser.id));
                return okay(res, {
                    users
                });
            }
            catch (err) {
                Winston.error(`Unabled to fetch linked mumble users of user ${user.username}`, err);
                return internalError(res);
            }
        }
    }
    catch (err) {
        Winston.error(`Error fetching user.`, err);
        return internalError(res);
    }
};
