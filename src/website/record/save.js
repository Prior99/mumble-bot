import * as Winston from "winston";
import * as HTTPCodes from "../httpcodes";

/**
 * <b>/record/save/</b> Page for saving a cached record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSave = function(bot) {
	return async function(req, res) {
		try {
			const labels = await bot.database.listLabels();
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
		catch(err) {
			Winston.error("Error listing labels", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	}
};

export default ViewSave;
