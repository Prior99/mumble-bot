var Winston = require("winston");
var Promise = require("promise");

module.exports = function(Database) {
	Database.prototype.writeUserStatsSpeak = function(user, started, ended, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("INSERT INTO UserStatsSpeaking(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended])
		.catch(callback)
		.then(function() {
			if(callback) {
				callback();
			}
		});
	};
	Database.prototype.writeUserStatsOnline = function(user, started, ended, callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("INSERT INTO UserStatsOnline(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended])
		.catch(callback)
		.then(function() {
			if(callback) {
				callback();
			}
		});
	};
	
};
