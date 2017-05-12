import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getSpokenPerUser } from "../../../database";

/**
 * API endpoint for statistics about speech per user.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SpokenPerUser = function(bot) {
    return async function(req, res) {
        try {
            const spoken = await getSpokenPerUser(bot.database);
            res.status(HTTP.OK).send(spoken);
        }
        catch (err) {
            Winston.error("Could not get amount of speech by user.", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default SpokenPerUser;
