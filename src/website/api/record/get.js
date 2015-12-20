import * as Winston from "winston";
import reply from "../util.js";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view returns the details to one specific record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewGet = function(bot) {
	return async function(req, res) {
		const id = req.query.id;
		if(id) {
			try {
				const rec = await bot.database.getRecord(id);
				reply(res, HTTPCodes.okay, true, { record : rec });
			}
			catch(err) {
				Winston.error("Error while getting record", err);
				reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
			}
		}
		else {
			reply(res, HTTPCodes.invalidRequest, false, { reason : "missing_argument" });
		}
	};
};

export default ViewGet;
