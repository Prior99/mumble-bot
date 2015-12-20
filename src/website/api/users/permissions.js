import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * List the permissions for one user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPermissions = function(bot) {
	return async function(req, res) {
		try {
			const user = await bot.database.getUserByUsername(req.query.username);
			if(user) {
				const permissions = await bot.permissions.listPermissionsForUser(req.session.user, user);
				res.status(HTTPCodes.okay).send({
					okay : true,
					permissions
				});
			}
			else {
				res.status(HTTPCodes.invalidRequest).send({
					okay : false,
					reason : "missing_argument"
				});
			}
		}
		catch(err) {
			res.status(HTTPCodes.internalError).send({
				okay : false,
				reason : "internal_error"
			});
		}
	};
};

export default ViewPermissions;
