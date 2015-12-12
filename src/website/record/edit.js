import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../httpcodes";

/**
 * <b>/record/edit/</b> Page for editing records.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewEdit = function(bot) {
	return function(req, res) {
		let labels, record;
		if(!req.query.id) {
			res.status(HTTPCodes.invalidRequest).send({
				okay : false,
				reason : "missing_argument"
			});
			return;
		}
		Promise.all([
			Promise.denodeify(bot.database.listLabels.bind(bot.database))(),
			Promise.denodeify(bot.database.getRecord.bind(bot.database))(req.query.id)
		])
		.then((results) => {
			labels = results[0];
			record = results[1];
			labels.forEach((label) => {
				if(record.labels.find((elem) => elem.id === label.id)) {
					label.has = true;
				}
			});
			res.locals.labels = labels;
			res.locals.record = record;
			res.render("record/edit");
		})
		.catch((err) => {
			Winston.error("An error occured while editing a record", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		});
	}
};

export default ViewEdit;
