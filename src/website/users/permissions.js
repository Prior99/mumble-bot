import * as Winston from "winston";

/**
 * <b>/users/permissions/:username</b> Manage the permissions for a user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Renderer for the content.
 */
const ViewUsersPermissions = function(bot) {
	return async function(req, res) {
		try {
			const user = await bot.database.getUserByUsername(req.params.username);
			if(user) {
				res.locals.user = user;
				const permissions = await bot.permissions.listPermissionsForUser(req.session.user, user);
				res.locals.permissions = permissions;
			}
			else {
				res.locals.permissions = [];
			}
		}
		catch(err) {
			res.locals.permissions = [];
			Winston.error("Could not fetch user: " + req.params.username, err);
		}
		res.render("users/permissions");
	};
};

export default ViewUsersPermissions;
