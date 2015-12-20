import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/**
 * API endpoint for statistics about speech per weekday.
 * server this bot is connected to.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewSpokenPerWeekday = function(bot) {
	return async function(req, res) {
		try {
			const spoken = await bot.database.getSpokenPerWeekday();
			res.status(HTTPCodes.okay).send(
				spoken.map((elem) => ({
					"amount" : elem.amount,
					"day" : weekdays[elem.day - 1]
				}))
			);
		}
		catch(err) {
			Winston.error("Could not get speech amount per weekday.", err);
			res.status(HTTPCodes.internalError).send([]);
		}
	};
};

export default ViewSpokenPerWeekday;
