var Winston = require("winston");

var ViewLabels = function(bot) {
	return function(req, res) {
		bot.database.listLabels(function(err, labels) {
			if(err) {
				Winston.error("Error listing labels", err);
				res.locals.labels = [];
			}
			else {
				res.locals.labels = labels;
			}
			res.render("record/labels");
		});
	}
};

module.exports = ViewLabels;
