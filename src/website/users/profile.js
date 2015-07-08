var Winston = require('winston');

/**
 * Returns only those users which have a unique id and are thous registered on
 * the mumble server.
 */
function getRegisteredMumbleUsers(mumble) {
	var users = mumble.users();
	var result = [];
	for(var i in users) {
		if(users[i].id) {
			result.push(users[i]);
		}
	}
	return result;
}

/**
 * <b>/users/profile/:username</b> Display the profile of a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewUsersProfile = function(bot) {
	function getMumbleUsersLinkingPossible(mumbleUsers, cb) {
		var arr = [];
		bot.database.getLinkedMumbleUsers(function(err, mumbleIds) {
			if(err) {
				Winston.error("Error fetching registered mumble users", err);
				cb([]);
			}
			else {
				for(var i in mumbleUsers) {
					var u = mumbleUsers[i];
					var linked = false;
					for(var j in mumbleIds) {
						if(mumbleIds[j].id == u.id) {
							linked = true;
							break;
						}
					}
					if(!linked && u.id != bot.mumble.user.id) {
						arr.push(u);
					}
				}
				cb(arr);
			}
		});
	}

	return function(req, res) {
		var username = req.params.username;
		bot.database.getUserByUsername(username, function(err, user) {
				if(err) {
					Winston.error("Error displaying profile of user " + username + ".", err);
					res.status(500).send("Internal error.");
				}
				else {
					if(user) {
						bot.database.getLinkedMumbleUsersOfUser(username, function(err, linkedUsers) {
							if(err) {
								Winston.error("Unabled to fetch linked mumble users of user " + username, err);
								linkedUsers = [];
							}
							getMumbleUsersLinkingPossible(getRegisteredMumbleUsers(bot.mumble), function(mumbleUsers) {
								res.locals.user = user;
								res.locals.freeMumbleUsers = mumbleUsers;
								res.locals.linkedUsers = linkedUsers;
								res.locals.own = req.session.user.id == user.id;
								res.render("users/profile");
							});
						})
					}
					else {
						res.status(404).send("Unknown user.");
					}
				}
			}
		);
	};
};

module.exports = ViewUsersProfile;
