var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		Winston.log('verbose', req.session.user.username + " playing quote #" + req.query.id);
		bot.quotes.speak(req.query.id);
		res.send(JSON.stringify({
			okay : true
		}));
	}
};
