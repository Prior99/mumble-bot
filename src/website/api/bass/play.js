module.exports = function(bot) {
	return function(req, res) {
		if(req.query.bass) {
			var string = JSON.parse(req.query.bass).join('');
			bot.say(string);
			res.status(200).send({
				okay : true
			});
		}
		else {
			res.status(400).send({
				okay : false,
				reason : "missing_arguments"
			})
		}
	}
};
