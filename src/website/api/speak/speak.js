import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const ViewSpeak = function(bot) {
	return async function(req, res) {
		if(req.query.text) {
			try {
				await bot.database.enterAutoComplete(req.query.text);
				Winston.log("verbose", req.session.user.username + " speak: \"" + req.query.text + "\"");
				bot.say(req.query.text);
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			catch(err) {
				Winston.error("Error entering autocomplete", err);
			}
		}
		else {
			res.status(HTTPCodes.invalidRequest).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};

export default ViewSpeak;
