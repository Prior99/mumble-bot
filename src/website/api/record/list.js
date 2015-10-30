var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.listRecords.bind(bot.database))()
		.then(function(records) {
			res.status(200).send({
				okay : true,
				records : records
			});
		})
		.catch(function(err) {
			Winston.error("Error listing records", err);
			res.status(500).send({
				okay : false,
				reason : "internal_error"
			});
		});
	};
};
