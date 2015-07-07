var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		function login(username) {
			bot.database.getUserByUsername(username, function(err, user) {
				if(err) {
					Winston.error("Error logging in user", err);
					res.send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					bot.permissions.hasPermission(user, "login", function(has) {
						if(has) {
							req.session.user = user;
							res.send({
								okay : true
							});
						}
						else {
							res.send({
								okay : false,
								reason : "insufficient_permission"
							});
						}
					});
				}
			});
		}

		if(req.session.user) {
			res.send({
				okay : false,
				reason : "already_logged_in"
			});
		}
		else {
			bot.database.checkLoginData(req.query.username, req.query.password, function(err, okay) {
				if(err) {
					Winston.error("Error checking whether user exists", err);
					res.send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					if(okay) {
						login(req.query.username);
					}
					else {
						res.send({
							okay : false,
							reason : "unknown_username_or_password"
						});
					}
				}
			});
		}
	}
};
