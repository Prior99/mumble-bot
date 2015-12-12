import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

/**
 * List all records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewList = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.listRecords.bind(bot.database))()
		.then((records) => {
			res.status(HTTPCodes.okay).send({
				okay : true,
				records
			});
		})
		.catch((err) => {
			Winston.error("Error listing records", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		});
	};
};

export default ViewList;
