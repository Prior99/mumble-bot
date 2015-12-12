import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Statistics view for playbacks per user.
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
		bot.database.lookupAutoComplete(text, (err, arr) => {
			if(err) {
				Winston.error("Error looking up autocomplete", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				res.status(HTTPCodes.okay).send({
					okay : true,
					suggestions : arr
				});
			}
		});
	};
};

export default ViewLookup;
