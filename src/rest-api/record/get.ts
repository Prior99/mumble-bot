import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { getRecord } from "../../database";

/**
 * This view returns the details to one specific record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Get = (bot) => async (req, res) => {
    const id = req.body.id;
    if (id) {
        try {
            const record = await getRecord(id, bot.database);
            res.status(HTTP.OK).send({ record })
        }
        catch (err) {
            Winston.error("Error while getting record", err);
            res.status(HTTP.INTERNAL_SERVER_ERROR).send({ reason: "internal_error" });
        }
    }
    else {
        res.status(HTTP.BAD_REQUEST).send({ reason: "missing_argument" });
    }
};;
