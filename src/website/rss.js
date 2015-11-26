var Winston = require('winston');

var RSS = function(bot) {
	return function(req, res) {
		bot.permissions.hasPermission(req.session.user, 'rss', function(has) {
			bot.database.listRSSFeeds(function(err, feeds) {
				if(err) {
					Winston.error("Could not retrieve list of feeds.", err);
					res.locals.feeds = [];
				}
				else {
					res.locals.feeds = feeds;
				}
				res.locals.canrss = has;
				res.render("rss");
			});
		});
	};
};

module.exports = RSS;
