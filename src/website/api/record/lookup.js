import * as Winston from "winston";
import reply from "../util.js";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view handles the lookup of records for creating dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLookup = function(bot) {
	return async function(req, res) {
		let text;
		if(req.query.text) {
			text = req.query.text;
		}
		else {
			text = "";
		}
		try {
			const arr = await bot.database.lookupRecord(text);
			reply(res, HTTPCodes.okay, true, { suggestions : arr });
		}
		catch(err) {
			Winston.error("Error looking up autocomplete", err);
			reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
		}
	};
};

export default ViewLookup;
