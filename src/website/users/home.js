import * as Winston from "winston";

/**
 * <b>/users/</b> Displays the home page for the /users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewUsersHome = function(bot) {
	return async function(req, res) {
		try {
			const count = await bot.database.countUsers();
			res.locals.count = count;
		}
		catch(err) {
			Winston.error("Error fetching count of users", err);
			res.locals.users = [];
		}
		res.render("users/home");
	};
};

export default ViewUsersHome;
