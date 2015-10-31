var Winston = require('winston');
require("../util.js");

module.exports = function(bot) {

	return function(req, res) {
		var ids = JSON.parse(req.query.dialog);
		var quotes = JSON.parse(req.query.quotes);
		if(ids && quotes) {
			
			function ptag(s) {
				return "<p>" + s + "</p>";
			}
			var quote = "";
			for(var i=0; i<quotes.length; i++) {
				quote += ptag(quotes[i]);
			}
			
			bot.database.addDialog(quote, new Date(), ids, function(err) {
				if(err) { 
					Winston.error("Error while saving dialog", err);
					reply(res, 500, false, { reason : "internal_error" });
				}	else { 
					reply(res, 200, true, {}); 
				}
			});
		} else {
			reply(res, 499, false, { reason : "missing_argument" });
		}
	};
	
};
