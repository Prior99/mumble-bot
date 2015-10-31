var Winston = require("winston");

var ViewDialogs = function(bot) {
	return function(req, res) {
		Winston.info("loading /dialogs");
		bot.database.listDialogs(function(err, dialogs) {
			if(err) {
				Winston.error("Error listing dialogs", err);
				res.locals.dialogs = [];
			}
			else {
				res.locals.dialogs = dialogs;
			}
			Winston.info("rendering");
			res.render("record/dialogs");
		});
	}
};

module.exports = ViewDialogs;
