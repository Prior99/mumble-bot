import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * Revoke a permission from a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewRevokePermission = function(bot) {
	return function(req, res) {
		/**
		 * Tries to revoke a permission from the user an answers the request with either success or failure.
		 * @param {number} user - The id of the user from which to revoke the permission.
		 * @param {string} permission - The permission to revoke.
		 * @return {undefined}
		 */
		const tryRevoke = function(user, permission) {
			bot.permissions.revokePermission(req.session.user, user, permission, (okay) => {
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
			});
		}

		const permission = req.query.permission;
		bot.database.getUserByUsername(req.query.user, (err, user) => {
			if(err) {
				Winston.error("Could not fetch user while granting permission", err);
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
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
		});
	}
};

export default ViewRevokePermission;
