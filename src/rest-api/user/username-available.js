import * as Winston from "winston";
import HTTPCodes from "../http-codes";

/**
 * Checks whether a username is available.
 * @param {object} bot - Pointer to the main bot instance.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const UsernameAvailable = function(bot) {
	return async function(req, res) {
		try {
			const user = await bot.database.getUserByUsername(req.body.username);
			res.status(HTTPCodes.okay).send({
				available : !Boolean(user)
			});
		}
		catch(err) {
			Winston.error("Error checking whether username is available", err);
			res.status(HTTPCodes.internalError).send({
				reason: "internal_error"
			});
		}
	}
};

export default UsernameAvailable;
