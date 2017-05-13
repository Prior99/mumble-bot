import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listUsers } from "../../database";
/**
 * <b>/users/list/</b> Displays a list of users.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Renderer for the content.
 */
const UsersList = function(bot) {
    return async function(req, res) {
        try {
            const users = await listUsers(bot.database);
            res.send({
                users
            });
        }
        catch (err) {
            Winston.error("Error fetching list of users", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default UsersList;
