import * as Winston from "winston";
import reply from "../util.js";
import HTTPCodes from "../../httpcodes";

/**
 * View for saving a new dialog.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const SaveDialog = function(bot) {
	return async function(req, res) {
		const dialog = req.body;
		if(dialog) {
			try {
				await bot.database.addDialog(dialog);
				res.status(HTTPCodes.okay).send(true);
			}
			catch(err) {
				Winston.error("Error while saving dialog", err);
				res.status(HTTPCodes.internalError).send({
					reason: "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				reason: "missing_argument"
			});
		}
	};
};

export default SaveDialog;
