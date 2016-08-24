import * as Winston from "winston";
import HTTPCodes from "../http-codes";

/**
 * This view returns the details to one specific record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Get = function(bot) {
	return async function(req, res) {
		const id = req.body.id;
		if(id) {
			try {
				const record = await bot.database.getRecord(id);
				reply(res, HTTPCodes.okay, true, { record });
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

export default Get;
