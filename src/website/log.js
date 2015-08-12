var Winston = require('winston');

var Log = function(bot) {
	return function(req, res) {
		bot.database.listLog(function(err, entries) {
			if(err) {
				Winston.error("Unabled to fetch logentries from database.", err);
				entries = [];
			}
			bot.permissions.hasPermission(req.session.user, 'log', function(has) {
				if(has) {
					res.locals.log = entries;
					res.render("log");
				}
				else {
					res.status(403).send("Forbidden.");
				}
			});
		});
	};
};

module.exports = Log;
