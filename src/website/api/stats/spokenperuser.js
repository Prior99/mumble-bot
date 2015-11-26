var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getSpokenPerUser.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not get amount of speech by user.", err);
			return [];
		})
		.then(function(spoken) {
			res.status(200).send(spoken);
		});
	};
};
