import * as Winston from "winston";
import * as HTTPCodes from "../httpcodes";

/**
 * <b>/record/save/</b> Page for saving a cached record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSave = function(bot) {
	return function(req, res) {
		bot.database.listLabels((err, labels) => {
			if(err) {
				Winston.error("Error listing labels", err);
				res.locals.labels = [];
			}
			else {
				res.locals.labels = labels;
				if(req.query.id) {
					const record = bot.getCachedAudioById(req.query.id);
					if(record) {
						res.locals.record = record;
						res.render("record/save");
					}
					else {
						res.status(HTTPCodes.invalidRequest).send({
							okay : false,
							reason : "invalid_argument"
						});
					}
				}
				else {
					res.status(HTTPCodes.invalidRequest).send({
						okay : false,
						reason : "missing_arguments"
					});
				}
			}
		});
	}
};

export default ViewSave;
