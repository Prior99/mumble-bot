import * as Winston from "winston";

/**
 * <b>/users/permissions/:username</b> Manage the permissions for a user.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Renderer for the content.
 */
const ViewUsersPermissions = function(bot) {
	return function(req, res) {
		bot.database.getUserByUsername(req.params.username, async (err, user) => {
			if(err) {
				res.locals.permissions = [];
				Winston.error("Could not fetch user: " + req.params.username, err);
			}
			else {
				if(user) {
					res.locals.user = user;
					const permissions = await bot.permissions.listPermissionsForUser(req.session.user, user);
					res.locals.permissions = permissions;
					res.render("users/permissions");
				}
				else {
					res.locals.permissions = [];
				}
			}
		});
	};
};

export default ViewUsersPermissions;
