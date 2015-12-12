import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Routes all requests related to the stats api commands in the /api/stats/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {Router} - router for the current section.
 */
const ViewSpeak = function(bot) {
	return function(req, res) {
		if(req.query.text) {
			bot.database.enterAutoComplete(req.query.text, (err) => {
				if(err) {
					Winston.error("Error entering autocomplete", err);
				}
			});
			Winston.log("verbose", req.session.user.username + " speak: \"" + req.query.text + "\"");
			bot.say(req.query.text);
			res.status(HTTPCodes.okay).send({
				okay : true
			});
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
