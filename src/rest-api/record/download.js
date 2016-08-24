import * as Winston from "winston";
import * as FS from "fs";
import HTTPCodes from "../../httpcodes";

/**
 * This view handles the downloading of records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Download = function(bot) {
	return function(req, res) {
		if(req.body.id) {
			const id = parseInt(req.body.id);
			const stream = FS.createReadStream(`sounds/recorded/${req.body.id}`;
			stream.on("error", (err) => {
				if(err.code === "ENOENT") {
					res.status(HTTPCodes.notFound).send({
						reason : "no_such_record"
					});
				}
				else {
					Winston.error("Error occured when trying to read record with id", req.body.id);
					res.status(HTTPCodes.internalError).send({
						reason : "internal_error"
					});
				}
			}).on("readable", async () => {
				try {
					const record = await bot.database.getRecord(req.body.id);
					res.status(HTTPCodes.okay).setHeader(
						"Content-disposition", `attachment; filename='${record.quote}.mp3'`
					);
					stream.pipe(res);
				}
				catch(err) {
					res.status(HTTPCodes.internalError).send({
						reason : "internal_error"
					});
					Winston.error(
						"Error occured when trying to fetch data about record to download from database",
						req.body.id
					);
				}
			});
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				reason : "missing_arguments"
			});
		}
	};
};

export default Download;
