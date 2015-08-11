var Winston = require('winston');

module.exports = function(bot) {

	function applySettings(settings, user, callback) {
		function next() {
			var setting = settings.pop();
			bot.database.setSetting(user, setting.key, setting.key, function(err) {
				if(err) {
					callback(err);
				}
				else {
					if(settings.length > 0) {
						next();
					}
					else {
						callback();
					}
				}
			});
		}
		if(settings.length > 0) {
			next();
		}
	}

	return function(req, res) {
		var settings = [];
		if(req.query.record) { settings.push({ key : 'record', val : req.query.record }); }
		/* ... */
		applySettings(settings, req.session.user, function(err) {
			if(err) {
				Winston.error("An error occured while saving settings for user " + req.session.user.username, err);
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				res.status(200).send({
					okay : true
				});
			}
		});
	};
};
