import * as Winston from "winston";
import * as Promise from "promise";

/**
 * <b>/record/</b> Homepage for the /record/ section displaying amount of records and a random-button.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewOverview = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getRecordCount.bind(bot.database))()
		.catch((err) => {
			Winston.error("Error getting record amount", err);
			return 0;
		})
		.then((count) => {
			res.locals.recordAmount = count;
			res.render("record/overview");
		});
	}
};

export default ViewOverview;
