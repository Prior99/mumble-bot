import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * List all records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewList = function(bot) {
	return async function(req, res) {
		try {
			const records = await bot.database.listRecords();
			res.status(HTTPCodes.okay).send({
				okay : true,
				records
			});
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
