var Winston = require("winston");

var ViewStored = function(bot) {
	return function(req, res) {
		res.render("record/stored");
	}
};

module.exports = ViewStored;
