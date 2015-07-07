var Winston = require('winston');

module.exports = function(bot) {
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
