import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserByUsername } from "../../../database";

/**
 * List the permissions for one user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Permissions = function(bot) {
    return async function(req, res) {
        try {
            const user = await getUserByUsername(req.body.username, bot.database);
            if (user) {
                const permissions = await bot.permissions.listPermissionsForUser(req.user, user);
                res.status(HTTP.OK).send({
                    permissions
                });
            }
            else {
                res.status(HTTP.BAD_REQUEST).send({
                    reason: "missing_argument"
                });
            }
        }
        catch (err) {
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default Permissions;
