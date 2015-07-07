module.exports = function(bot) {
	return function(req, res) {

		function tryGrant(user, permission) {
			bot.permissions.revokePermission(req.session.user, user, permission, function(okay) {
				if(okay) {
					res.status(200).send({
						okay : true
					});
				}
				else {
					res.status(401).send({
						okay : false,
						reason : "insufficient_permission"
					});
				}
			});
		}

		var permission = req.query.permission;
		bot.database.getUserByUsername(req.query.user, function(err, user) {
			if(err) {
				Winston("Could not fetch user while granting permission", err);
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				if(user) {
					tryGrant(user, permission);
				}
				else {
					res.status(400).send({
						okay : false,
						reason : "unknown_user"
					});
				}
			}
		});
	}
};
