var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getRecordCountByUsers.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not get record count by users.", err);
			return [];
		})
		.then(function(records) {
			return records;
		})
		.then(function(arr) {
			res.status(200).send(arr);
		});
	};
};
