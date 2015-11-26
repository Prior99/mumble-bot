var Winston = require('winston');
var colorify = require('../../../colorbystring');

module.exports = function(bot) {
	return function(req, res) {
		if(req.query.name && req.query.name.trim().length > 0) {
			if(req.query.name.indexOf(" ") != -1) {
				res.status(400).send({
					okay : false,
					reason : "invalid_argument"
				});
				return;
			}
			bot.database.addRecordLabel(req.query.name, function(err, id) {
				if(err) {
					Winston.error("Unabled to add new label", err);
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
				else {
					Winston.log('verbose', req.session.user.username + " added new label for records: \"" + req.query.name + "\"");
					res.status(200).send({
						okay : true,
						color : colorify(req.query.name),
						id : id
					});
				}
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
