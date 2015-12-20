import * as Winston from "winston";
import * as FS from "fs";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view handles the downloading of records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewDownload = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			const stream = FS.createReadStream("sounds/recorded/" + req.query.id)
			.on("error", (err) => {
				if(err.code === "ENOENT") {
					res.status(HTTPCodes.notFound).send({
						okay : false,
						reason : "no_such_record"
					});
				}
				else {
					Winston.error("Error occured when trying to read record with id", req.query.id);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
				}
			}).on("readable", async () => {
				try {
					const record = await bot.database.getRecord(req.query.id);
					res.status(HTTPCodes.okay).setHeader(
						"Content-disposition", "attachment; filename=" + record.quote + ".mp3"
					);
					stream.pipe(res);
				}
				catch(err) {
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
					Winston.error(
						"Error occured when trying to fetch data about record to download from database",
						req.query.id
					);
				}
			});
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewDownload;
