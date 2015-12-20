import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Statistics view for playbacks per user.
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
			const arr = await bot.database.lookupAutoComplete(text);
			res.status(HTTPCodes.okay).send({
				okay : true,
				suggestions : arr
			});
		}
		catch(err) {
			Winston.error("Error looking up autocomplete", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	};
};

export default ViewLookup;
