var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		var user = bot.database.getUserByUsername(req.params.username, function(err, user) {
			if(err) {
				res.locals.permissions = [];
				Winston.error("Could not fetch user: " + req.params.username, err);
			}
			else {
				if(user) {
					res.locals.user = user;
					bot.permissions.listPermissionsForUser(req.session.user, user, function(permissions) {
						res.locals.permissions = permissions;
						res.render("users/permissions");
					});
				}
				else {
					res.locals.permissions = [];
				}
			}
		});
	};
};
