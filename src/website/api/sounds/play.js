var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			bot.database.usedSound(req.query.id, function(err) {
				if(err) {
					Winston.error("Could not increase usages of sound", err);
					res.status(500).send({
						okay: false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log('verbose', req.session.user.username + " played sound #" + req.query.id);
					bot.playSound("sounds/uploaded/" + req.query.id);
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
