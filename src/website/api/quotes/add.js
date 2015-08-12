var Winston = require('winston');

function enterQuote(author, quote, bot, res, req) {
	bot.database.addQuote(quote, author, function(err, id) {
		if(err) {
			Winston.error("Error occured when entering quote into database: " + err);
			res.status(500).send(JSON.stringify({
				okay : false,
				reason : "internal_error"
			}));
		}
		else {
			Winston.log('verbose', req.session.user.username + " added new quote #" + id);
			res.send(JSON.stringify({
				okay : true,
				id : id
			}));
		}
	});
}

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.author && req.query.quote) {
			bot.permissions.hasPermission(req.session.user, "add-quote", function(has) {
				if(has) {
					enterQuote(req.query.author, req.query.quote, bot, res, req);
				}
				else {
					res.status(401).send(JSON.stringify({
						okay : false,
						reason: "insufficient_permission"
					}));
				}
			});
		}
		else {
			res.send(JSON.stringify({
				okay : false,
				reason: "missing_arguments"
			}));
		}
	}
};
