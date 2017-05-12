import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * API endpoint for statistics about speech per hour.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RecordsPerUser = function(bot) {
    return async function(req, res) {
        try {
            const arr = await bot.database.getRecordCountByUsers();
            res.status(HTTPCodes.okay).send(arr);
        }
        catch(err) {
            Winston.error("Could not get record count by users.", err);
            res.status(HTTPCodes.internalError).send({
                reason: "internal_error"
            });
        }
    };
};

export default RecordsPerUser;
