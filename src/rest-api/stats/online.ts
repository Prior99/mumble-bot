import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getOnlinePerUser } from "../../database";

/**
 * Statistics view for playbacks per user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const OnlinePerUser = function(bot) {
    return async function(req, res) {
        try {
            const spoken = await getOnlinePerUser(bot.database);
            res.status(HTTP.OK).send(spoken);
        }
        catch (err) {
            Winston.error("Could not get amount of online time by user.", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    };
};

export default OnlinePerUser;
