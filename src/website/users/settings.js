var Winston = require('winston');


var ViewSettings = function(bot) {

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
		var user = req.session.user;
		bot.database.getUserByUsername(user.username, function(err, user) { //Reload user from database
			if(err) {
				Winston.error("Error displaying profile of user " + username + ".", err);
				res.status(500).send("Internal error.");
			}
			else {
				if(user) {
					getMumbleUsersLinkingPossible(bot.getRegisteredMumbleUsers(), function(mumbleUsers) {
						bot.database.getLinkedMumbleUsersOfUser(user.username, function(err, linkedUsers) {
							if(err) {
								Winston.error("Unabled to fetch linked mumble users of user " + user.username, err);
								linkedUsers = [];
							}
							res.locals.user = user;
							res.locals.linkedUsers = linkedUsers.map(function(user) { return bot.mumble.userById(user.id); });
							res.locals.freeMumbleUsers = mumbleUsers;
							res.render("users/settings");
						});
					});
				}
				else {
					res.status(404).send("Unknown user.");
				}
			}
		});
	};
};

module.exports = ViewSettings;
