import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserByUsername } from "../../database";

/**
 * Checks whether a username is available.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const UsernameAvailable = function(bot) {
    return async function(req, res) {
        try {
            const user = await getUserByUsername(req.body.username, bot.database);
            res.status(HTTP.OK).send({
                available: !Boolean(user)
            });
        }
        catch (err) {
            Winston.error("Error checking whether username is available", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    }
};

export default UsernameAvailable;
