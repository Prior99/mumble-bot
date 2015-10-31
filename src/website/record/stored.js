var Winston = require("winston");

var ViewStored = function(bot) {
	return function(req, res) {
		if(req.query.tag) {
			bot.database.listRecordsByLabel(req.query.tag, function(err, records) {
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
		else {
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
	}
};

module.exports = ViewStored;
