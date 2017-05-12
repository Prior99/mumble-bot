import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { updateRecord } from "../../database";

/**
 * This is the view for the api for editing records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Edit = (bot) => async (req, res) => {
    if (req.body.id && req.body.quote && req.body.labels) {
        const labels = JSON.parse(req.body.labels);
        const quote = req.body.quote;
        const id = req.body.id;
        try {
            await updateRecord(id, quote, labels, bot.database);
            Winston.log("verbose", `${req.user.username} edited record #${id}`);
            res.status(HTTP.OK).send(true);
        }
        catch (err) {
            Winston.error("Could not edit record in database", err);
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
