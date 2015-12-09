var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, 'rss', function(has) {
			if(req.query.id) {
				if(has) {
					bot.database.removeRSSFeed(req.query.id, function(err) {
						if(err) {
							Winston.error("Could not remove new RSS feed.", err);
							res.status(500).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							Winston.verbose(req.session.user.username + " removed rss-feed with id " + req.query.id);
							res.status(200).send({
								okay : true
							});
						}
					});
				}
				else {
					res.status(401).send({
						okay : false,
						reason : "permission_denied"
					});
				}
			}
			else {
				res.status(499).send({
					okay : false,
					reason : "missing_arguments"
				});
			}
		});
	};
};
