import * as Winston from "winston";

/**
 * <b>/users/</b> Displays the home page for the /users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 * @return {ViewRenderer} - Feeded view renderer for this endpoint.
 */
const ViewUsersHome = function(bot) {
	return function(req, res) {
		bot.database.countUsers((err, count) => {
			if(err) {
				Winston.error("Error fetching count of users", err);
				res.locals.users = [];
			}
			else {
				res.locals.count = count;
				res.render("users/home");
			}
		});
	};
};

export default ViewUsersHome;
