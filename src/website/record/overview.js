import * as Winston from "winston";

/**
 * <b>/record/</b> Homepage for the /record/ section displaying amount of records and a random-button.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewOverview = function(bot) {
	return async function(req, res) {
		try {
			const count = await bot.database.getRecordCount();
			res.locals.recordAmount = count;
		}
		catch(err) {
			Winston.error("Error getting record amount", err);
			res.locals.recordAmount = 0;
		}
		res.render("record/overview");
	}
};

export default ViewOverview;
