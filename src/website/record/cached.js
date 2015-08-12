var Winston = require("winston");

var ViewCached= function(bot) {
	return function(req, res) {
		res.locals.cached = bot.cachedAudios;
		res.render("record/cached");
	}
};

module.exports = ViewCached;
