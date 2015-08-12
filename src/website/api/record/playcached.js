var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			var sound = bot.getCachedAudioById(req.query.id);
			if(sound) {
				bot.playSound(sound.file);
				Winston.log('verbose', req.session.user.username + " played back cached record #" + req.query.id);
				res.status(200).send({
					okay : true
				});
			}
			else {
				res.status(400).send({
					okay : false,
					reason : "invalid_argument"
				});
			}
		}
		else {
			res.status(499).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};
