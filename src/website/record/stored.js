var Winston = require("winston");

var ViewCached= function(bot) {
	return function(req, res) {
		res.render("record/stored");
	}
};

module.exports = ViewCached;
