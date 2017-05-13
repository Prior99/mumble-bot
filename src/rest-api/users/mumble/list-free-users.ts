import { Bot } from "../../..";
import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getLinkedMumbleUsers } from "../../../database";
import { internalError, okay } from "../../utils";
import { AuthorizedApiEndpoint } from "../../types";

async function getMumbleUsersLinkingPossible(bot: Bot) {
    const mumbleUsers = bot.getRegisteredMumbleUsers();
    try {
        const arr = [];
        const mumbleIds = await getLinkedMumbleUsers(bot.database);
        return mumbleUsers.reduce((result, user) => {
            const linked = mumbleIds.reduce((linkedId, id) => id.id === user.id || linkedId, false);
            if (!linked && user.id !== bot.mumble.user.id) {
                return [...result, user];
            }
            return result;
        }, []);
    }
    catch (err) {
        Winston.error("Error fetching registered mumble users", err);
        return [];
    }
}

export const ListFreeUsers: AuthorizedApiEndpoint = (bot: Bot) => async (req, res) => {
    try {
        const users = await getMumbleUsersLinkingPossible(bot);
        okay(res, { users });
    }
    catch (err) {
        Winston.error("Error fetching unlinked users.", err);
        return internalError(res);
    }
};
