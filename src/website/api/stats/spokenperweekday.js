var Winston = require('winston');
var Promise = require('promise');

var weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

module.exports = function(bot) {
	return function(req, res) {
		Promise.denodeify(bot.database.getSpokenPerWeekday.bind(bot.database))()
		.catch(function(err) {
			Winston.error("Could not get speech amount per weekday.", err);
			return [];
		})
		.then(function(spoken) {
			res.status(200).send(spoken.map(function(elem) {
                return {
                    amount : elem.amount,
                    day : weekdays[elem.day - 1]
                }
            }));
		});
	};
};
