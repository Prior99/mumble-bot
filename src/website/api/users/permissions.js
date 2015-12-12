import * as Winston from "winston";
import * as HTTPCodes from "../../httpcodes";

/**
 * List the permissions for one user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - View renderer for this endpoint.
 */
const ViewPermissions = function(bot) {
	return function(req, res) {
		const user = bot.database.getUserByUsername(req.query.username, (err, user) => {
			if(err) {
				res.status(HTTPCodes.internalError).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				if(user) {
					bot.permissions.listPermissionsForUser(req.session.user, user, (permissions) => {
						res.status(HTTPCodes.okay).send({
							okay : true,
							permissions
						});
					});
				}
				else {
					res.status(HTTPCodes.invalidRequest).send({
						okay : false,
						reason : "missing_argument"
					});
				}
			}
		});
	};
};

export default ViewPermissions;
