var Winston = require('winston');

/**
 * <b>/users/</b> Displays the home page for the /users/ endpoint.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewUsersHome = function(bot) {
	return function(req, res) {
		bot.database.countUsers(function(err, count) {
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

module.exports = ViewUsersHome;
