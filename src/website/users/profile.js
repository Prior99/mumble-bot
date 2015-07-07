var Winston = require('winston');
/**
 * <b>/users/profile/:username</b> Display the profile of a specific user.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var ViewUsersProfile = function(bot) {
	return function(req, res) {
		var username = req.params.username;
		bot.database.getUserByUsername(username, function(err, user) {
			if(err) {
				Winston.error("Error displaying profile of user " + username + ".", err);
				res.status(500).send("Internal error.");
			}
			else {
				if(user) {
					res.locals.user = user;
					res.render("users/profile");
				}
				else {
					res.status(404).send("Unknown user.");
				}
			}
		});
	};
};

module.exports = ViewUsersProfile;
