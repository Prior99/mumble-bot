import * as Winston from "winston";
import * as FS from "fs";
import HTTPCodes from "../http-codes";

/**
 * This is the view for the api for editing records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Edit = function(bot) {
    return async function(req, res) {
        if(req.body.id && req.body.quote && req.body.labels) {
            const labels = JSON.parse(req.body.labels);
            const quote = req.body.quote;
            const id = req.body.id;
            try {
                await bot.database.updateRecord(id, quote, labels);
                Winston.log("verbose", `${req.user.username} edited record #${id}`);
                res.status(HTTPCodes.okay).send(true);
            }
            catch(err) {
                Winston.error("Could not edit record in database", err);
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

export default Edit;
