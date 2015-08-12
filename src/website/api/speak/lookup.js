var Winston = require('winston');


module.exports = function(bot) {
	return function(req, res) {
		var text;
		if(req.query.text) { text = req.query.text; }
		else { text = ""; }
		bot.database.lookupAutoComplete(text, function(err, arr) {
			if(err) {
				Winston.error("Error looking up autocomplete", err);
				res.status(500).send({
					okay : false,
					reason : "internal_error"
				});
			}
			else {
				res.status(200).send({
					okay : true,
					suggestions : arr
				});
			}
		});
	};
};
