import * as Winston from "winston";
import * as FS from "fs";
import * as HTTP from "http-status-codes";
import { getRecord } from "../../database";

/**
 * This view handles the downloading of records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const Download = (bot) => (req, res) => {
    if (req.body.id) {
        const id = parseInt(req.body.id);
        const stream = FS.createReadStream(`sounds/recorded/${req.body.id}`);
        stream.on("error", (err) => {
            if (err.code === "ENOENT") {
                res.status(HTTP.NOT_FOUND).send({
                    reason: "no_such_record"
                });
            }
            else {
                Winston.error("Error occured when trying to read record with id", req.body.id);
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
            }
        }).on("readable", async () => {
            try {
                const record = await getRecord(req.body.id, bot.database);
                res.status(HTTP.OK).setHeader(
                    "Content-disposition", `attachment; filename='${record.quote}.mp3'`
                );
                stream.pipe(res);
            }
            catch (err) {
                res.status(HTTP.INTERNAL_SERVER_ERROR).send({
                    reason: "internal_error"
                });
                Winston.error(
                    "Error occured when trying to fetch data about record to download from database",
                    req.body.id
                );
            }
        });
    }
    else {
        res.status(HTTP.BAD_REQUEST).send({
            reason: "missing_arguments"
        });
    }
};
