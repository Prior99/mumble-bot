var Winston = require("winston");

var ViewCached= function(bot) {
	return function(req, res) {
		bot.database.listRecords(function(err, records) {
			if(err) {
				Winston.error("Error listing records", err);
				res.locals.records = [];
			}
			else {
				res.locals.records = records;
			}
			res.render("record/stored");
		});
	}
};

module.exports = ViewCached;
