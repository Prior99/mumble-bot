import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * Revoke a permission from a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RevokePermission = function(bot) {
    return async function(req, res) {
        const { permission } = req.body;
        try {
            const user = await bot.database.getUserByUsername(req.body.user);
            if(user) {
                if(await bot.permissions.revokePermission(req.user, user, permission)) {
                    res.status(HTTPCodes.okay).send(true);
                }
                else {
                    res.status(HTTPCodes.insufficientPermission).send({
                        reason : "insufficient_permission"
                    });
                }
            }
            else {
                res.status(HTTPCodes.invalidRequest).send({
                    reason : "unknown_user"
                });
            }
        }
        catch(err) {
            Winston.error("Could not fetch user while granting permission", err);
            res.status(HTTPCodes.internalError).send({
                reason : "internal_error"
            });
        }
    }
};

export default RevokePermission;
