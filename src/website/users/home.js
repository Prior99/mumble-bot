var Winston = require('winston');

module.exports = function(bot) {
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
