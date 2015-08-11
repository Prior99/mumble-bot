var Winston = require('winston');
var FS = require('fs');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id && req.query.quote) {
			var sound = bot.getCachedAudioById(req.query.id);
			var quote = req.query.quote;
			try { FS.mkdirSync('records'); } catch(err) { }
			bot.database.addRecord(quote, sound.user, sound.date, function(err, id) {
				if(err) {
					Winston.error("Could not add record to database.", err);
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					FS.rename(sound.file, "records/" + id, function(err) {
						if(err) {
							Winston.error("Could not rename new record file.", err);
							res.status(500).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							if(bot.removeCachedAudio(sound)) {
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
