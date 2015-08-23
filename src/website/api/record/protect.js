var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			if(bot.protectCachedAudio(req.query.id)) {
				res.status(200).send({
					okay : true
				});
			}
			else {
				res.status(500).send({
					okay : false,
					reason : "internal_error"
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
