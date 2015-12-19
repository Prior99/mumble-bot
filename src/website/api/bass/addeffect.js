import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for displaying all effects.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewAddEffect = function(bot) {
	return function(req, res) {
		if(req.query.effect && req.query.effect.trim().length > 0) {
			bot.database.addBassEffect(req.query.effect, (err) => {
				if(err) {
					if(err.code !== "ER_DUP_ENTRY") {
						Winston.error("Unabled to add ne effects", err);
					}
					res.status(HTTPCodes.invaldRequest).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log("verbose",
						req.session.user.username + " added new bass-effect: \"" + req.query.effect + "\""
					);
					res.status(HTTPCodes.okay).send({
						okay : true
					});
				}
			});
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				okay : false,
				reason : "missing_arguments"
			})
		}
	}
};

export default ViewAddEffect;
