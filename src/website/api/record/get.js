var Winston = require('winston');
var reply = require("../util.js").reply;

module.exports = function(bot) {
	return function(req, res) {
		var id = req.query.id;
		if(id) {
			bot.database.getRecord(id, function(err, rec) {
				if(err) {
					Winston.error("Error while getting record", err);
					reply(res, 500, false, { reason : "internal_error" });
				}	else {
					reply(res, 200, true, { record : rec });
				}
			});
		}	else {
			reply(res, 400, false, { reason : "missing_argument" });
		}
	};
};
