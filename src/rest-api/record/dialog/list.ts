import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { listDialogs } from "../../../database";

/**
 * <b>/record/dialogs/</b> Page for list of dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Dialogs = function(bot) {
    return async function(req, res) {
        try {
            const dialogs = await listDialogs(bot.database);
            res.send({ dialogs });
        }
        catch (err) {
            Winston.error("Error listing dialogs", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).render({
                reason: "internal_error"
            });
        }
    }
};

export default Dialogs;
