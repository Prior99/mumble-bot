var Winston = require('winston');
var FS = require('fs');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id && req.query.quote && req.query.labels) {
			var labels = JSON.parse(req.query.labels);
			var sound = bot.getCachedAudioById(req.query.id);
			var quote = req.query.quote;
				try {
					FS.mkdirSync("sounds/recorded");
				}
				catch(e) {
					if(e.code !== "EEXIST") {
						throw e;
					}
				}
			bot.database.addRecord(quote, sound.user, sound.date, labels, function(err, id) {
				if(err) {
					Winston.error("Could not add record to database.", err);
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					FS.rename(sound.file, "sounds/recorded/" + id, function(err) {
						if(err) {
							Winston.error("Could not rename new record file.", err);
							res.status(500).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							if(bot.removeCachedAudio(sound)) {
								Winston.log('verbose', req.session.user.username + " added new record #" + id);
								res.status(200).send({
									okay : true
								});
							}
							else {
								Winston.error("Could not remove element from array of cached audios.");
								res.status(500).send({
									okay : false,
									reason : "internal_error"
								});
							}
						}
					});
				}
			});
		}
		else {
			res.status(499).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};
