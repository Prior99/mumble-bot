var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		var user = bot.database.getUserByUsername(req.query.username, function(err, user) {
			if(err) {
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				if(user) {
					bot.permissions.listPermissionsForUser(req.session.user, user, function(permissions) {
						res.status(200).send({
							okay : true,
							permissions : permissions
						});
					});
				}
				else {
					res.status(400).send({
						okay : false,
						reason : "missing_argument"
					});
				}
			}
		});
	};
};
