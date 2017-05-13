import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecordingCountByDays } from "../../../database";

/**
 * This view displays the statistics for the records per time endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const RecordingsPerTime = function(bot) {
    return async function(req, res) {
        try {
            const spoken = await getRecordingCountByDays(bot.database);
            res.status(HTTP.OK).send(spoken);
        }
        catch (err) {
            Winston.error("Could not get record count by days.", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default RecordsPerTime;

