module.exports = function(bot) {
	return function(req, res) {
		bot.database.getFreeIdentifiers(function(err, identifiers) {
			if(err) {
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
