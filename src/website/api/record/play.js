var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			bot.database.usedRecord(req.query.id, function(err) {
				if(err) {
					Winston.error("Could not increase usages of record", err);
					res.status(500).send({
						okay: false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log('verbose', req.session.user.username + " played back record #" + req.query.id);
					bot.playSound("sounds/recorded/" + req.query.id);
					res.status(200).send({
						okay : true
					});
				}
			});
		}
		else {
			res.status(499).send({
				okay : false,
				reason : "missing_arguments"
			})
		}
	};
};
