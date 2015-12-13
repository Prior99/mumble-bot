var Winston = require("winston");
var Promise = require("promise");
/**
 * Extends the database with methods for statistics.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseUserStats = function(Database) {
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
	Database.prototype.getSpokenPerHour = function(callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT HOUR(started) AS hour, SUM(TIME_TO_SEC(ended-started)) AS amount FROM UserStatsSpeaking GROUP BY HOUR(started)")
		.catch(callback)
		.then(function(rows) {
			if(callback) {
				callback(null, rows.map(function(elem) {
					return {
						hour : elem.hour,
						amount : new Date(elem.amount * 1000)
					}
				}));
			}
		});

	};
	Database.prototype.getSpokenPerUser = function(callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount FROM UserStatsSpeaking LEFT JOIN Users u ON user = u.id GROUP BY user")
		.catch(callback)
		.then(function(rows) {
			if(callback) {
				callback(null, rows.map(function(elem) {
					return {
						user : elem.user,
						amount : new Date(elem.amount * 1000)
					}
				}));
			}
		});
	};
	Database.prototype.getSpokenPerWeekday = function(callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT DAYOFWEEK(started) AS day, SUM(TIME_TO_SEC(ended-started)) AS amount FROM UserStatsSpeaking GROUP BY DAYOFWEEK(started)")
		.catch(callback)
		.then(function(rows) {
			if(callback) {
				callback(null, rows.map(function(elem) {
					return {
						day : elem.day,
						amount : new Date(elem.amount * 1000)
					}
				}));
			}
		});
	};
	Database.prototype.getOnlinePerUser = function(callback) {
		Promise.denodeify(this.pool.query.bind(this.pool))("SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount FROM UserStatsOnline LEFT JOIN Users u ON user = u.id GROUP BY user")
		.catch(callback)
		.then(function(rows) {
			if(callback) {
				callback(null, rows.map(function(elem) {
					return {
						user : elem.user,
						amount : new Date(elem.amount * 1000)
					}
				}));
			}
		});
	};
};

export default DatabaseUserStats;
