var Winston = require("winston");

var ViewCreateDialogs = function(bot) {
	return function(req, res) {
		res.render("record/create_dialog");
	};
};

module.exports = ViewCreateDialogs;
