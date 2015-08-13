var Winston = require('winston');

/**
 * <b>/users/profile/:username</b> Display the profile of a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewUsersProfile = function(bot) {


	function fetchUser(username, req, res) {
		bot.database.getUserByUsername(username, function(err, user) {
			if(err) {
				Winston.error("Error displaying profile of user " + username + ".", err);
				res.status(500).send("Internal error.");
			}
			else {
				if(user) {
					fetchRecords(user, username, req, res);
				}
				else {
					res.status(404).send("Unknown user.");
				}
			}
		});
	}

	function fetchRecords(user, username, req, res) {
			bot.database.listRecordsForUser(user, function(err, records) {
				if(err) {
					Winston.error("Error fetching records of user " + username + ".", err);
					records = [];
				}
				fetchLinkedMumbleUsers(records, user, username, req, res);
			});
	}

	function fetchLinkedMumbleUsers(records, user, username, req, res) {
		bot.database.getLinkedMumbleUsersOfUser(username, function(err, linkedUsers) {
			if(err) {
				Winston.error("Unabled to fetch linked mumble users of user " + username, err);
				linkedUsers = [];
			}
			renderPage(linkedUsers, records, user, username, req, res);
		});
	}

	function renderPage(linkedUsers, records, user, username, req, res) {
		res.locals.user = user;

		res.locals.linkedUsers = linkedUsers.map(function(user) { return bot.mumble.userById(user.id); });
		res.locals.own = req.session.user.id == user.id;
		res.locals.records = records;
		res.render("users/profile");
	}

	return function(req, res) {
		var username = req.params.username;
		fetchUser(username, req, res);
	};
};

module.exports = ViewUsersProfile;
