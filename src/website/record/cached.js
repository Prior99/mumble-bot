var Winston = require("winston");

var ViewCached= function(bot) {
	return function(req, res) {
		var copy = bot.cachedAudios.slice();
		res.locals.cached = copy.sort(function(a, b) {
			if(a.protected === b.protected) {
				return a.date > b.date ? -1 : 1;
			}
			else {
				return a.protected ? -1 : 1;
			}
		});
		res.render("record/cached");
	}
};

module.exports = ViewCached;
