import * as Winston from "winston";
import { colorify } from "../../colorbystring";
import * as HTTP from "http-status-codes";
import { addRecordLabel } from "../../database";

/**
 * This endpoint handles adding labels to the database..
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const AddLabel = (bot) => async (req, res) => {
    if (req.body.name && req.body.name.trim().length > 0) {
        if (req.body.indexOf(" ") !== -1) {
            res.status(HTTP.BAD_REQUEST).send({
                reason: "invalid_argument"
            });
            return;
        }
        try {
            const id = await addRecordLabel(req.query.name, bot.database);
            Winston.log("verbose", `${req.user.username} added new label for records: "${req.query.name}"`);
            res.status(HTTP.OK).send({
                color: colorify(req.query.name),
                id
            });
        }
        catch (err) {
            Winston.error("Unabled to add new label", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                reason: "internal_error"
            });
        }
    }
    else {
        res.status(HTTP.BAD_REQUEST).send({
            reason: "missing_arguments"
        })
    }
};
