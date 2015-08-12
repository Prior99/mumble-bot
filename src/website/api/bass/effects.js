var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		bot.database.listBassEffects(function(err, effects) {
			if(err) {
				Winston.error("Unabled to get list of effects", err);
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				res.send({
					okay :true,
					effects: effects
				});
			}
		});
	}
};
