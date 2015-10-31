var Winston = require('winston');
var reply = require("../util.js");

module.exports = function(bot) {
	return function(req, res) {
		var text;
		if(req.query.text) { text = req.query.text; }
		else { text = ""; }
		bot.database.lookupRecord(text, function(err, arr) {
			if(err) {
				Winston.error("Error looking up autocomplete", err);
				reply(res, 500, false, { reason : "internal_error" });
			}
			else {
				reply(res, 200, true, { suggestions : arr });
			}
		});
	};
};
