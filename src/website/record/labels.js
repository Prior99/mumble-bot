import * as Winston from "winston";

/**
 * <b>/record/labels/</b> Page for listing and creating labels.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewLabels = function(bot) {
	return function(req, res) {
		bot.database.listLabels((err, labels) => {
			if(err) {
				Winston.error("Error listing labels", err);
				res.locals.labels = [];
			}
			else {
				res.locals.labels = labels;
			}
			res.render("record/labels");
		});
	}
};

export default ViewLabels;
