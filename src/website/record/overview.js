var Winston = require("winston");
var Promise = require("promise");

var ViewOverview = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getRecordCount.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Error getting record amount", err);
			return 0;
		})
		.then(function(c) {
			return c;
		})
		.then(function() {
			res.locals.recordAmount = count;
			res.render("record/overview");
		});
	}
};

module.exports = ViewOverview;
