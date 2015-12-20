import * as Winston from "winston";
import HTTPCodes from "../httpcodes";

/**
 * <b>/record/edit/</b> Page for editing records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewEdit = function(bot) {
	return async function(req, res) {
		if(!req.query.id) {
			res.status(HTTPCodes.invalidRequest).send({
				okay : false,
				reason : "missing_argument"
			});
			return;
		}
		try {
			const labels = await bot.database.listLabels();
			const record = await bot.database.getRecord(req.query.id);
			labels.forEach((label) => {
				if(record.labels.find((elem) => elem.id === label.id)) {
					label.has = true;
				}
			});
			res.locals.labels = labels;
			res.locals.record = record;
			res.render("record/edit");
		}
		catch(err) {
			Winston.error("An error occured while editing a record", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	}
};

export default ViewEdit;
