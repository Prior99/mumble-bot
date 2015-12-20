import * as Winston from "winston";
import * as Promise from "promise";

/**
 * <b>/record/dialogs/</b> Page for list of dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewDialogs = function(bot) {
	return async function(req, res) {
		try {
			const dialogs = await bot.database.listDialogs();
			res.locals.dialogs = dialogs;
			res.render("record/dialogs");
		}
		catch(err) {
			Winston.error("Error listing dialogs", err);
			res.locals.dialogs = [];
			res.render("record/dialogs");
		}
	}
};

export default ViewDialogs;
