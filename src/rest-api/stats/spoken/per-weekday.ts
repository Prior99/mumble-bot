import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getSpokenPerWeekday } from "../../../database";

const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/**
 * API endpoint for statistics about speech per weekday.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SpokenPerWeekday = function(bot) {
    return async function(req, res) {
        try {
            const spoken = await getSpokenPerWeekday(bot.database);
            res.status(HTTP.OK).send(
                spoken.map((elem) => ({
                    "amount": elem.amount,
                    "day": weekdays[elem.day - 1]
                }))
            );
        }
        catch (err) {
            Winston.error("Could not get speech amount per weekday.", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default SpokenPerWeekday;
