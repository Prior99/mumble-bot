import * as Winston from "winston";
import * as Promise from "promise";
import * as HTTPCodes from "../../httpcodes";

/**
 * View for playing back a random record.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRandomPlayback = function(bot) {
	return function(req, res) {
		let record;
		Promise.denodeify(bot.database.getRandomRecord.bind(bot.database))()
		.catch((err) => {
			Winston.error("Could not fetch random record", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason : "internal_error"
			});
		})
		.then((r) => {
			record = r;
			return new Promise.denodeify(bot.database.usedRecord.bind(bot.database))(record.id);
		})
		.catch((err) => {
			Winston.error("Could not increase usage of record", err);
			res.status(HTTPCodes.internalError).send({
				okay: false,
				reason : "internal_error"
			});
		})
		.then(() => {
			Winston.log("verbose", req.session.user.username + " played back random record  with id #" + record.id);
			bot.playSound("sounds/recorded/" + record.id);
			res.status(HTTPCodes.okay).send({
				okay : true
			});
		});
	};
};

export default ViewRandomPlayback;
