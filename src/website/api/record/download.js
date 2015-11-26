var Winston = require('winston');
var FS = require('fs');
module.exports = function(bot) {
	return function(req, res) {
		if(req.query.id) {
			var stream = FS.createReadStream("sounds/recorded/" + req.query.id)
			.on('error', function(err) {
				if(err.code == 'ENOENT') {
					res.status(404).send({
						okay : false,
						reason : "no_such_record"
					});
				}
				else {
					Winston.error("Error occured when trying to read record with id", req.query.id);
					res.status(500).send({
						okay : false,
						reason : "internal_error"
					});
				}
			}).on('readable', function() {
				bot.database.getRecord(req.query.id, function(err, record) {
					if(err) {
						res.status(500).send({
							okay : false,
							reason : "internal_error"
						});
						Winston.error("Error occured when trying to fetch data about record to download from database", req.query.id);
					}
					else {
						res.status(200).setHeader('Content-disposition', 'attachment; filename=' + record.quote + '.mp3');
						stream.pipe(res);
					}
				});
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
