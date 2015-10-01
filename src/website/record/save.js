var Winston = require("winston");

var ViewCached= function(bot) {
	return function(req, res) {
		bot.database.listLabels(function(err, labels) {
			if(err) {
				Winston.error("Error listing labels", err);
				res.locals.labels = [];
			}
			else {
				res.locals.labels = labels;
				if(req.query.id) {
					var record = bot.getCachedAudioById(req.query.id);
					if(record) {
						res.locals.record = record;
						res.render("record/save");
					}
					else {
						res.status(400).send({
							okay : false,
							reason : "invalid_argument"
						});
					}
				}
				else {
					res.status(400).send({
						okay : false,
						reason : "missing_arguments"
					});
				}
			}
		});
	}
};

module.exports = ViewCached;
