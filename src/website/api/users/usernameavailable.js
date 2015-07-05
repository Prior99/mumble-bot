module.exports = function(bot) {
	return function(req, res) {
		bot.database.getUserByUsername(req.query.username, function(err, user) {
			if(err) {
				res.status(500).send(JSON.stringify({
					okay : false
				}));
			}
			else {
				if(user) {
					res.status(400).send(JSON.stringify({
						okay : true,
						available : false
					}));
				}
				else {
					res.status(200).send(JSON.stringify({
						okay : true,
						available : true
					}));
				}
			}
		});
	}
};
