var Winston = require('winston');

var ViewQueue = function(bot) {
	return function(req, res) {
		res.locals.queue = bot.output.queue;
		res.render('queue');
	};
};

module.exports = ViewQueue;
