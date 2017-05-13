import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getUserByUsername } from "../../../database";

/**
 * Revoke a permission from a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RevokePermission = function(bot) {
    return async function(req, res) {
        const { permission } = req.body;
        try {
            const user = await getUserByUsername(req.body.user, bot.database);
            if (user) {
                if (await bot.permissions.revokePermission(req.user, user, permission)) {
                    res.status(HTTP.OK).send(true);
                }
                else {
                    res.status(HTTP.FORBIDDEN).send({
                        reason: "insufficient_permission"
                    });
                }
            }
            else {
                res.status(HTTP.BAD_REQUEST).send({
                    reason: "unknown_user"
                });
            }
        }
        catch (err) {
            Winston.error("Could not fetch user while granting permission", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    }
};

export default RevokePermission;
