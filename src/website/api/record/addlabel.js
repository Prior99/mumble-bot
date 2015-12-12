import * as Winston from "winston";
import * as colorify from "../../../colorbystring";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for adding labels.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAddLabel = function(bot) {
	return function(req, res) {
		if(req.query.name && req.query.name.trim().length > 0) {
			if(req.query.name.indexOf(" ") !== -1) {
				res.status(HTTPCodes.invalidArgument).send({
					okay : false,
					reason : "invalid_argument"
				});
				return;
			}
			bot.database.addRecordLabel(req.query.name, (err, id) => {
				if(err) {
					Winston.error("Unabled to add new label", err);
					res.status(HTTPCodes.internalError).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log("verbose",
						req.session.user.username + " added new label for records: \"" + req.query.name + "\""
					);
					res.status(HTTPCodes.okay).send({
						okay : true,
						color : colorify(req.query.name),
						id
					});
				}
			});
		}
		else {
			res.status(HTTPCodes.invalidRequest).send({
				okay : false,
				reason : "missing_arguments"
			})
		}
	}
};

export default ViewAddLabel;
