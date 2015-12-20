import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Revoke a permission from a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRevokePermission = function(bot) {
	return async function(req, res) {
		/**
		 * <b>Async</b> Tries to revoke a permission from the user and
		 * answers the request with either success or failure.
		 * @param {number} user - The id of the user from which to revoke the permission.
		 * @param {string} permission - The permission to revoke.
		 * @return {undefined}
		 */
		const tryRevoke = async function(user, permission) {
			const okay = await bot.permissions.revokePermission(req.session.user, user, permission);
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
		};

		const permission = req.query.permission;
		try {
			const user = await bot.database.getUserByUsername(req.query.user);
			if(user) {
				tryRevoke(user, permission);
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

export default ViewRevokePermission;
