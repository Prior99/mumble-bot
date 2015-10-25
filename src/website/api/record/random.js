var Winston = require('winston');
var Promise = require('promise');

module.exports = function(bot) {
	return function(req, res) {
		var record;
		Promise.denodeify(bot.database.getRandomRecord.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not fetch random record", err);
			res.status(500).send({
				okay: false,
				reason : "internal_error"
			});
		})
		.then(function(r) {
			record = r;
			return new Promise.denodeify(bot.database.usedRecord.bind(bot.database))(record.id);
		})
		.catch(function(err) {
			Winston.error("Could not increase usage of record", err);
			res.status(500).send({
				okay: false,
				reason : "internal_error"
			});
		})
		.then(function() {
			Winston.log('verbose', req.session.user.username + " played back random record  with id #" + record.id);
			bot.playSound("sounds/recorded/" + record.id);
			res.status(200).send({
				okay : true
			});
		});
	};
};
