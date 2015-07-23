var Creator = function(bot) {
	return function(req, res) {
		bot.database.listBassEffects(function(err, effects) {
			if(err) {
				Winston.error("Unable to fetch list of effects", err);
				effects = [];
			}
			res.locals.effects = effects;
			res.render("bass/designer");
		})
	}
};

module.exports = Creator;
