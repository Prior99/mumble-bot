import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Checks whether a username is available.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewUsernameAvailable = function(bot) {
	return function(req, res) {
		bot.database.getUserByUsername(req.query.username, (err, user) => {
			if(err) {
				Winston.error("Error checking whether username is available", err);
				res.status(HTTPCodes.internalError).send(JSON.stringify({
					okay : false
				}));
			}
			else {
				if(user) {
					res.status(HTTPCodes.invalidRequest).send(JSON.stringify({
						okay : true,
						available : false
					}));
				}
				else {
					res.status(HTTPCodes.okay).send(JSON.stringify({
						okay : true,
						available : true
					}));
				}
			}
		});
	}
};

export default ViewUsernameAvailable;
