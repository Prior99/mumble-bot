var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, 'rss', function(has) {
			if(req.query.url && req.query.name) {
				if(has) {
					bot.rss.markAllArticlesAsKnown(req.query.url);
					bot.database.addRSSFeed(req.query.url, req.query.name, function(err) {
						if(err) {
							Winston.error("Could not add new RSS feed.", err);
							res.status(500).send({
								okay : false,
								reason : "internal_error"
							});
						}
						else {
							Winston.verbose(req.session.user.username + " added an rss-feed: " + req.query.url);
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
