import * as Winston from "winston";
import * as colorify from "../../../colorbystring";
import HTTPCodes from "../../httpcodes";

/**
 * This endpoint handles adding labels to the database..
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const AddLabel = function(bot) {
	return async function(req, res) {
		if(req.body.name && req.body.name.trim().length > 0) {
			if(req.body.indexOf(" ") !== -1) {
				res.status(HTTPCodes.invalidArgument).send({
					reason : "invalid_argument"
				});
				return;
			}
			try {
				const id = await bot.database.addRecordLabel(req.query.name);
				Winston.log("verbose", `${req.user.username} added new label for records: "${req.query.name}"`);
				res.status(HTTPCodes.okay).send({
					color : colorify(req.query.name),
					id
				});
			}
			catch(err) {
				Winston.error("Unabled to add new label", err);
				res.status(HTTPCodes.internalError).send({
					reason : "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.invalidRequest).send({
				reason : "missing_arguments"
			})
		}
	}
};

export default AddLabel;
