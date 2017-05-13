import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { addDialog } from "../../../database";

/**
 * View for saving a new dialog.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SaveDialog = function(bot) {
    return async function(req, res) {
        const dialog = req.body;
        if (dialog) {
            try {
                await addDialog(dialog, bot.database);
                res.status(HTTP.OK).send(true);
            }
            catch (err) {
                Winston.error("Error while saving dialog", err);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTP.BAD_REQUEST).send({
                reason: "missing_argument"
            });
        }
    };
};

export default SaveDialog;
