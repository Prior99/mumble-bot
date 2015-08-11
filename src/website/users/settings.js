var Winston = require('winston');


var ViewSettings = function(bot) {
	return function(req, res) {
		var user = req.session.user;
		bot.database.getUserByUsername(user.username, function(err, user) { //Reload user from database
			if(err) {
				Winston.error("Error displaying profile of user " + username + ".", err);
				res.status(500).send("Internal error.");
			}
			else {
				if(user) {
					res.locals.user = user;
					res.render("users/settings")
				}
				else {
					res.status(404).send("Unknown user.");
				}
			}
		});
	};
};

module.exports = ViewSettings;
