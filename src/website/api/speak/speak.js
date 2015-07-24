var Winston = require('winston');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.text) {
			bot.database.enterAutoComplete(req.query.text, function(err) {
				if(err) {
					Winston.error("Error entering autocomplete", err);
				}
			});
			bot.say(req.query.text);
			res.status(200).send({
				okay : true
			});
		}
		else {
			res.status(400).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};
