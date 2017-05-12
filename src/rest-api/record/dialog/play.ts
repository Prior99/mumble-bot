import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * This view plays back saved dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const PlayDialog = function(bot) {
    return async function(req, res) {
        if(req.body.id) {
            try {
                await bot.database.usedDialog(req.body.id);
                const parts = await bot.database.getDialogParts(req.body.id);
                const files = parts.map(part => `sounds/recorded/${part}`);
                bot.output.playSounds(files, {
                    type : "dialog",
                    user : req.user
                });
            }
            catch(err) {
                Winston.error("Could not play dialog", err);
                res.status(HTTPCodes.internalError).send({
                    reason : "internal_error" 
                });
            }
        }
        else {
            res.status(HTTPCodes.missingArguments).send({
                reason : "missing_arguments" 
            });
        }
    };
};

export default PlayDialog;
