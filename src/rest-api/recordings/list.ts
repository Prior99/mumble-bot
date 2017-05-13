import * as Winston from "winston";
import * as HTTP from "http-status-codes";
import { PassThrough as PassThroughStream } from "stream";
import { listRecordings } from "../../database";

/**
 * List all records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
export const List = (bot) => async (req, res) => {
    try {
        let since;
        if (req.body.since) {
            since = new Date(+req.body.since);
        }
        const stream = new PassThroughStream();
        res.status(HTTP.OK);
        res.set("Content-type", "application/json");
        stream.pipe(res);
        const records = await listRecordings(since, bot.database);
        stream.write(JSON.stringify({
            records
        }));
        stream.end();
    }
    catch (err) {
        Winston.error("Error listing records", err);
        res.status(HTTP.INTERNAL_SERVER_ERROR).send({
            reason: "internal_error"
        });
    }
};
