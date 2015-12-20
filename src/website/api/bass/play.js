import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * View for playing back a bass song.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPlay = function(bot) {
	return function(req, res) {
		if(req.query.bass) {
			const string = JSON.parse(req.query.bass).join(" ");
			bot.say(string);
			Winston.log("verbose", req.session.user.username + " played a bassline");
			res.status(HTTPCodes.okay).send({
				okay : true
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

export default ViewPlay;
