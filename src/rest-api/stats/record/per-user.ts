import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecordCountByUsers } from "../../../database";

/**
 * API endpoint for statistics about speech per hour.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RecordsPerUser = function(bot) {
    return async function(req, res) {
        try {
            const arr = await getRecordCountByUsers(bot.database);
            res.status(HTTP.OK).send(arr);
        }
        catch (err) {
            Winston.error("Could not get record count by users.", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default RecordsPerUser;
