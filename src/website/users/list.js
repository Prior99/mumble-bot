var Winston = require('winston');
/**
 * <b>/users/list/</b> Displays a list of users.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewUsersList = function(bot) {
	return function(req, res) {
		bot.database.listUsers(function(err, users) {
			if(err) {
				Winston.error("Error fetching list of users", err);
				res.locals.users = [];
			}
			else {
				res.locals.users = users;
				res.render("users/list");
			}
		});
	};
};

module.exports = ViewUsersList;
