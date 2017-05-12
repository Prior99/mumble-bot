import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * This view displays the statistics for the records per time endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RecordsPerTime = function(bot) {
    return async function(req, res) {
        try {
            const spoken = await bot.database.getRecordCountByDays();
            res.status(HTTPCodes.okay).send(spoken);
        }
        catch(err) {
            Winston.error("Could not get record count by days.", err);
            res.status(HTTPCodes.internalError).send({
                reason: "internal_error"
            });
        }
    };
};

export default RecordsPerTime;
