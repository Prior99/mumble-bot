var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getRecordPlaybackCountPerUser.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not get playbacks of records by user.", err);
			return [];
		})
		.then(function(spoken) {
			res.status(200).send(spoken);
		});
	};
};
