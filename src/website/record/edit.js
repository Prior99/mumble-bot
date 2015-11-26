var Winston = require("winston");
var Promise = require("promise");

var ViewCached= function(bot) {
	return function(req, res) {
		var labels, record;
		if(!req.query.id) {
			res.status(400).send({
				okay : false,
				reason : "missing_argument"
			});
			return;
		}
		Promise.all([
			Promise.denodeify(bot.database.listLabels.bind(bot.database))(),
			Promise.denodeify(bot.database.getRecord.bind(bot.database))(req.query.id)
		])
		.then(function(results) {
			labels = results[0];
			record = results[1];
			labels.forEach(function(label) {
				if(record.labels.find(function(elem) {
					return elem.id === label.id;
				})) {
					label.has = true;
				}
			});
			res.locals.labels = labels;
			res.locals.record = record;
			res.render("record/edit");
		})
		.catch(function(err) {
			Winston.error("An error occured while editing a record", err);
			res.status(500).send({
				okay : false,
				reason : "internal_error"
			});
		});
	}
};

module.exports = ViewCached;
