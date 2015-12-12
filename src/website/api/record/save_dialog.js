import * as Winston from "winston";
import reply from "../util.js";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for saving a new dialog.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSaveDialog = function(bot) {
	return function(req, res) {
		const ids = JSON.parse(req.query.dialog);
		if(ids) {
			bot.database.addDialog(ids, (err) => {
				if(err) {
					Winston.error("Error while saving dialog", err);
					reply(res, HTTPCodes.internalError, false, { reason : "internal_error" });
				}
				else {
					reply(res, HTTPCodes.okay, true, {});
				}
			});
		}
		else {
			reply(res, HTTPCodes.missingArguments, false, { reason : "missing_argument" });
		}
	};
};

export default ViewSaveDialog;
