import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";
import {PassThrough as PassThroughStream} from "stream";

/**
 * List all records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewList = function(bot) {
	return async function(req, res) {
		try {
			let since;
			if(req.query.since) {
				since = new Date(+req.query.since);
			}
			const stream = new PassThroughStream();
			res.status(HTTPCodes.okay);
			res.set("Content-type", "application/json");
			stream.pipe(res);
			const records = await bot.database.listRecords(since);
			stream.write(JSON.stringify({
				okay : true,
				records
			}));
			stream.end();
		}
		catch(err) {
			Winston.error("Error listing records", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	};
};

export default ViewList;
