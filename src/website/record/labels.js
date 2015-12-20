import * as Winston from "winston";

/**
 * <b>/record/labels/</b> Page for listing and creating labels.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLabels = function(bot) {
	return async function(req, res) {
		try {
			const labels = await bot.database.listLabels();
			res.locals.labels = labels;
		}
		catch(err) {
			Winston.error("Error listing labels", err);
			res.locals.labels = [];
		}
		res.render("record/labels");
	}
};

export default ViewLabels;
