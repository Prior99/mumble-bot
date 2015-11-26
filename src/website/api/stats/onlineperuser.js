var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getOnlinePerUser.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not get amount of online time by user.", err);
			return [];
		})
		.then(function(spoken) {
			res.status(200).send(spoken);
		});
	};
};
