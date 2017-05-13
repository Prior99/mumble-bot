import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getLinkedMumbleUsersOfUser, getUserByUsername } from "../../../database";

export const ListLinkedUsers = (bot) => async (req, res) => {
    try {
        const user = await getUserByUsername(req.body.user.username, bot.database); //Reload user from database
        if (user) {
            try {
                const linkedUsers = await getLinkedMumbleUsersOfUser(user.username, bot.database);
                const users = linkedUsers.map(user => bot.mumble.userById(user.id));
                res.send({
                    users
                });
            }
            catch (err) {
                Winston.error(`Unabled to fetch linked mumble users of user ${user.username, err}`);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTP.NOT_FOUND).send({
                reason: "invalid_argument"
            });
        }
    }
    catch (err) {
        Winston.error(`Error fetching user.`, err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send({
            reason: "internal_error"
        });
    }
};
