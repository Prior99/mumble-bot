var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getSpokenPerHour.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not get amount of speech by hour of the day.", err);
			return [];
		})
		.then(function(arr) {
			res.status(200).send(arr);
		});
	};
};
