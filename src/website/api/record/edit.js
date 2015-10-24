var Winston = require('winston');
var FS = require('fs');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id && req.query.quote && req.query.labels) {
			var labels = JSON.parse(req.query.labels);
			var quote = req.query.quote;
			var id = req.query.id;

			bot.database.updateRecord(id, quote, labels, function(err) {
				if(err) {
					Winston.error("Could not edit record in database", err);
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log('verbose', req.session.user.username + " edited record #" + id);
					res.status(200).send({
						okay : true
					});
				}
			});
		}
		else {
			res.status(499).send({
				okay : false,
				reason : "missing_arguments"
			});
		}
	};
};
