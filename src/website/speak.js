var Speak = function(bot) {
	return function(req, res) {
		res.render("speak");
	};
};

module.exports = Speak;
