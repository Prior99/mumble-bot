var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		bot.database.getFreeIdentifiers(function(err, identifiers) {
			if(err) {
				Winston.error("Unable to fetch list of identifiers", err);
				res.locals.identifiers = [];
			}
			else {
				res.locals.identifiers = identifiers;
			}
			res.render("users/registerlogin", {
				layout : "registerlogin"
			});
		});
	}
};
