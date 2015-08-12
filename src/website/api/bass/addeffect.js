var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.effect && req.query.effect.trim().length > 0) {
			bot.database.addBassEffect(req.query.effect, function(err) {
				if(err) {
					if(err.code !== "ER_DUP_ENTRY") {
						Winston.error("Unabled to add ne effects", err);
					}
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log('verbose', req.session.user.username + " added new bass-effect: \"" + req.query.effect + "\"");
					res.status(200).send({
						okay : true
					});
				}
			});
		}
		else {
			res.status(400).send({
				okay : false,
				reason : "missing_arguments"
			})
		}
	}
};
