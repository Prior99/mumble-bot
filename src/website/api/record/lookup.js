import * as Winston from "winston";
import reply from "../util.js";
import * as HTTPCodes from "../../httpcodes";

/**
 * This view handles the lookup of records for creating dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLookup = function(bot) {
	return function(req, res) {
		let text;
		if(req.query.text) {
			text = req.query.text;
		}
		else {
			text = "";
		}
		bot.database.lookupRecord(text, (err, arr) => {
			if(err) {
				Winston.error("Error looking up autocomplete", err);
				reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
			}
			else {
				reply(res, HTTPCodes.okay, true, { suggestions : arr });
			}
		});
	};
};

export default ViewLookup;
