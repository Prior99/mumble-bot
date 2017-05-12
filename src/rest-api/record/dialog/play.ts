import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { usedDialog, getDialogParts } from "../../../database";

/**
 * This view plays back saved dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const PlayDialog = function(bot) {
    return async function(req, res) {
        if (req.body.id) {
            try {
                await usedDialog(req.body.id, bot.database);
                const parts = await getDialogParts(req.body.id, bot.database);
                const files = parts.map(part => `sounds/recorded/${part}`);
                bot.output.playSounds(files, {
                    type: "dialog",
                    user: req.user
                });
            }
            catch (err) {
                Winston.error("Could not play dialog", err);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }
        else {
            res.status(HTTP.BAD_REQUEST).send({
                reason: "missing_arguments"
            });
        }
    };
};

export default PlayDialog;
