var Winston = require("winston");
var Promise = require("promise");

var ViewDialogs = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.listDialogs.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Error listing dialogs", err);
			res.locals.dialogs = [];
			res.render("record/dialogs");
		})
		.then(function(dialogs) {
			res.locals.dialogs = dialogs;
			res.render("record/dialogs");
		});
	}
};

module.exports = ViewDialogs;
