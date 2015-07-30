var Winston = require('winston');
var Request = require('request');
/**
 * <b>/api/google/</b> Looks up something on the google autocomplete api.
 * @param {Bot} bot - Bot the webpage belongs to.
 */
var Google = function(bot) {
	return function(req, res) {
		if(req.query.string) {
			Request.get({
				url  :"https://www.google.de/s?sclient=psy-ab&oe=utf-8&ie=UTF-8&q=" + req.query.string,
				encoding  : "utf8"
			}, function(err, f, body) {
				if(err || f.statusCode !== 200) {
					Winston.error("Error when fetching google lookup. Error:", err, "status code was", f.statusCode);
					res.status(500).send({
						okay : false,
						reason: "internal_error"
					});
				}
				else {
					var result = [];
					body = JSON.parse(body);
					for(var i in body[1]) {
						var arr = body[1][i];
						var s = decodeURIComponent(arr[0]).replace(/<\/?b>/g, "");
						bot.say(s);
						result.push(s);
					}
					res.status(200).send({
						okay : true,
						results : result
					});
				}
			});
		}
		else {
			res.status(400).send({
				okay : false,
				reason: "missing_arguments"
			});
		}
	};
};

module.exports = Google;
