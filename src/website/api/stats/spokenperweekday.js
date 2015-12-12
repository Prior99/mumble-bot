import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/**
 * API endpoint for statistics about speech per weekday.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSpokenPerWeekday = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getSpokenPerWeekday.bind(bot.database))()
		.catch((err) => {
			Winston.error("Could not get speech amount per weekday.", err);
			return [];
		})
		.then((spoken) => {
			res.status(HTTPCodes.okay).send(
				spoken.map((elem) => ({ "amount" : elem.amount, "day" : weekdays[elem.day - 1] }))
			);
		});
	};
};

export default ViewSpokenPerWeekday;
