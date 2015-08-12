var Sounds = function(bot) {
	return function(req, res) {
		bot.database.listSounds(function(err, sounds) {
			if(err) {
				Winston.error("Could not get list of sounds", err);
				res.locals.sounds = [];
			}
			else {
				res.locals.sounds = sounds;
			}
			res.render("sounds/sounds");
		});
	};
};

module.exports = Sounds;
