import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listLog } from "../database";
/**
 * This handles the /log endpoint with the list of the latest log entries when the needed permission is given.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
export const Log = (bot) => async (req, res) => {
    try {
        if (await bot.permissions.hasPermission(req.user, "log")) {
            res.send({
                entries: await listLog(bot.database)
            });
        }
        else {
            res.send({
                reason: "insufficient_permission"
            });
        }
    }
    catch (err) {
        Winston.error("Unabled to fetch logentries from database.", err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send(JSON.stringify({
            reason: "internal_error"
        }));
    }
};
