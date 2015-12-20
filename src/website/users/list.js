import * as Winston from "winston";
/**
 * <b>/users/list/</b> Displays a list of users.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Renderer for the content.
 */
const ViewUsersList = function(bot) {
	return async function(req, res) {
		try {
			const users = await bot.database.listUsers();
			res.locals.users = users;
		}
		catch(err) {
			Winston.error("Error fetching list of users", err);
			res.locals.users = [];
		}
		res.render("users/list");
	};
};

export default ViewUsersList;
