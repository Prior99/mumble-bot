import * as Winston from "winston";
import HTTPCodes from "../../httpcodes";

/**
 * Grant a permission to a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewGrantPermission = function(bot) {
	return async function(req, res) {
		/**
		 * <b>Async</b> Tries to grant a permission from the user an answers the request with either success or failure.
		 * @param {number} user - The id of the user from which to revoke the permission.
		 * @param {string} permission - The permission to revoke.
		 * @return {undefined}
		 */
		const tryGrant = async function(user, permission) {
			const okay = await bot.permissions.grantPermission(req.session.user, user, permission);
			if(okay) {
				res.status(HTTPCodes.okay).send({
					okay : true
				});
			}
			else {
				res.status(HTTPCodes.insufficientPermission).send({
					okay : false,
					reason : "insufficient_permission"
				});
			}
		}

		const permission = req.query.permission;
		try {
			const user = await bot.database.getUserByUsername(req.query.user);
			if(user) {
				tryGrant(user, permission);
			}
			else {
				res.status(HTTPCodes.invalidRequest).send({
					okay : false,
					reason : "unknown_user"
				});
			}
		}
		catch(err) {
			Winston.error("Could not fetch user while granting permission", err);
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	}
};

export default ViewGrantPermission;
