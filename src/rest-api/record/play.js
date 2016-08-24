import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

const moneyPerPlayReporter = 1;
const moneyPerPlayUser = 1;

/**
 * This view is responsible for playing back a stored record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Play = function(bot) {
	return async function(req, res) {
		if(req.body.id) {
			try {
				const details = await bot.database.getRecord(req.body.id);
				if(req.user.id !== details.reporter.id) {
					await bot.database.giveUserMoney(details.reporter, moneyPerPlayReporter);
				}
				if(req.user.id !== details.user.id) {
					await bot.database.giveUserMoney(details.user, moneyPerPlayUser);
				}
				await bot.database.usedRecord(req.body.id);
				Winston.log("verbose", `${req.user.username} played back record #${req.body.id}`);
				bot.playSound("sounds/recorded/" + req.body.id, {
					type: "record",
					details,
					user: req.user
				});
				res.status(HTTPCodes.okay).send(true);
			}
			catch(err) {
				Winston.error("Could not increase usages of record", err);
				res.status(HTTPCodes.internalError).send({
					reason: "internal_error"
				});
			}
		}
		else {
			res.status(HTTPCodes.missingArguments).send({
				reason: "missing_arguments"
			});
		}
	};
};
export default Play;
