import * as Winston from "winston";
import HTTPCodes from "../../http-codes";

/**
 * List the permissions for one user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const Permissions = function(bot) {
	return async function(req, res) {
		try {
			const user = await bot.database.getUserByUsername(req.body.username);
			if(user) {
				const permissions = await bot.permissions.listPermissionsForUser(req.user, user);
				res.status(HTTPCodes.okay).send({
					permissions
				});
			}
			else {
				res.status(HTTPCodes.invalidRequest).send({
					reason : "missing_argument"
				});
			}
		}
		catch(err) {
			res.status(HTTPCodes.internalError).send({
				reason : "internal_error"
			});
		}
	};
};

export default Permissions;
