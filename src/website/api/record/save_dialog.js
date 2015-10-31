var Winston = require('winston');
var reply = require("../util.js").reply;

module.exports = function(bot) {

	return function(req, res) {
		var ids = JSON.parse(req.query.dialog);
		if(ids) {
			bot.database.addDialog(ids, function(err) {
				if(err) {
					Winston.error("Error while saving dialog", err);
					reply(res, 500, false, { reason : "internal_error" });
				}
				else {
					reply(res, 200, true, {});
				}
			});
		}
		else {
			reply(res, 499, false, { reason : "missing_argument" });
		}
	};

};
