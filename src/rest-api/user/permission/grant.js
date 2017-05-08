import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * Grant a permission to a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const GrantPermission = function(bot) {
    return async function(req, res) {

        const permission = req.body.permission;
        try {
            const user = await bot.database.getUserByUsername(req.body.user);
            if(user) {
                if(await bot.permissions.grantPermission(req.user, user, permission)) {
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

export default GrantPermission;
