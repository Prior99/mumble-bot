import * as Winston from "winston";
import HTTPCodes from "./http-codes";
/**
 * This handles the /log endpoint with the list of the latest log entries when the needed permission is given.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const Log = function(bot) {
    return async function(req, res) {
        try {
            if(await bot.permissions.hasPermission(req.user, "log")) {
                res.send({
                    entries: await bot.database.listLog()
                });
            }
            else {
                res.send({
                    reason: "insufficient_permission"
                });
            }
        }
        catch(err) {
            Winston.error("Unabled to fetch logentries from database.", err);
            res.status(HTTPCodes.internalError).send(JSON.stringify({
                reason: "internal_error"
            }));
        }
    };
};

export default Log;
