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
			for(var i in ids) {
				var id = ids[i];
				var mumbleUser = getMumbleUser(id);
				if(mumbleUser) {
					mumbleUser.moveToChannel(bot.options.kickChannel);
				}
			}
		});
	};

	function kickUserByIdentifier(args) {
		if(args.length == 1) {
			bot.database.getUserByIdentifier(args[0], function(err, user) {
				if(err) {
					Winston.error("Error fetching user by identifier.", err);
				}
				else {
					if(user) {
						kickUser(user);
					}
					else {
						Winston.warn("Tried to kick user by identifier that does not exist: " + args[0]);
					}
				}
			});
		}
	};

	bot.database.getAllIdentifiers(function(err, identifiers) {
		if(err) {
			Winston.error("Error fetching all identifiers.", err);
		}
		else {
			var arguments = [];
			for(var i in identifiers) { arguments.push(identifiers[i].identifier); }
			bot.newCommand("kick", kickUserByIdentifier, "Wird eine Person aus dem Mumble-Server werfen.", "legal", arguments);
		}
		callback();
	});
	return true;
};
