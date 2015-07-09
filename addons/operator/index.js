var Winston = require('winston');

module.exports = function(bot, callback) {

	function getMumbleUser(id) {
		var users = bot.mumble.users();
		for(var i in users) {
			var user = users[i];
			if(user.id == id) {
				return user;
			}
		}
		return null;
	};

	function kickUser(user) {
		bot.database.getLinkedMumbleUsersOfUser(user.username, function(err, ids) {
			if(err) {
				Winston.error("Unable to fetch lined mumble users of user " + user.username, err);
			}
			else {
				for(var i in ids) {
					var id = ids[i].id;
					var mumbleUser = getMumbleUser(id);
					if(mumbleUser) {
						Winston.info("Moving mumble user \"" + mumbleUser.name + "\" to channel "+ "\"" + bot.options.kickChannel + "\".");
						mumbleUser.moveToChannel(bot.options.kickChannel);
					}
				}
			}
		});
	};

	function kickUserByIdentifier(via, user, identifier) {
		bot.database.getUserByIdentifier(identifier, function(err, user) {
			if(err) {
				Winston.error("Error fetching user by identifier.", err);
			}
			else {
				if(user) {
					bot.say(user.username + " verpiss dich.", function() {
						kickUser(user);
					});
				}
				else {
					Winston.warn("Tried to kick user by identifier that does not exist: " + identifier);
				}
			}
		});
	};

	function whoIs(via, user, identifier) {
		bot.database.getUserByIdentifier(identifier, function(err, user) {
			if(err) {
				Winston.error("Error fetching user by identifier.", err);
			}
			else {
				if(user) {
					bot.say(identifier + " ist " + user.username + ".");
				}
				else {
					bot.say(identifier + " ist unbekannt.");
				}
			}
		});
	}

	bot.database.getAllIdentifiers(function(err, identifiers) {
		if(err) {
			Winston.error("Error fetching all identifiers.", err);
		}
		else {
			var arguments = [];
			for(var i in identifiers) { arguments.push(identifiers[i].identifier); }
			bot.newCommand("kick", kickUserByIdentifier, "Wird eine Person aus dem Mumble-Server werfen.", "legal", arguments);
			bot.newCommand("who is", whoIs, "Wird eine Person aus dem Mumble-Server werfen.", "legal", arguments);
		}
		callback();
	});
	return true;
};
