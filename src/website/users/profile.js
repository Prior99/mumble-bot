var Winston = require('winston');

module.exports = function(bot) {
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
