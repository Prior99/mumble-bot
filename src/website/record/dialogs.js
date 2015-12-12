import * as Winston from "winston";
import * as Promise from "promise";

/**
 * <b>/record/dialogs/</b> Page for list of dialogs.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewDialogs = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.listDialogs.bind(bot.database))()
		.catch((err) => {
			Winston.error("Error listing dialogs", err);
			res.locals.dialogs = [];
			res.render("record/dialogs");
		})
		.then((dialogs) => {
			res.locals.dialogs = dialogs;
			res.render("record/dialogs");
		});
	}
};

export default ViewDialogs;
