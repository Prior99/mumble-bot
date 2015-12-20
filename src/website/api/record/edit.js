import * as Winston from "winston";
import * as FS from "fs";
import * as HTTPCodes from "../../httpcodes";

/**
 * This is the view for the api for editing records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewEdit = function(bot) {
	return async function(req, res) {
		if(req.query.id && req.query.quote && req.query.labels) {
			const labels = JSON.parse(req.query.labels);
			const quote = req.query.quote;
			const id = req.query.id;
			try {
				await bot.database.updateRecord(id, quote, labels);
				Winston.log("verbose", req.session.user.username + " edited record #" + id);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				Winston.error("Could not edit record in database", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewEdit;
