import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * <b>/record/dialogs/</b> Page for list of dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Dialogs = function(bot) {
	return async function(req, res) {
		try {
			const dialogs = await bot.database.listDialogs();
			res.send({ dialogs });
		}
		catch(err) {
			Winston.error("Error listing dialogs", err);
			res.status(HTTPCodes.internalError).render({
				reason: "internal_error"
			});
		}
	}
};

export default Dialogs;
