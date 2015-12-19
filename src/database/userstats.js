import * as Winston from "winston";
/**
 * Extends the database with methods for statistics.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const UserStatsExtension = function(Database) {
	const millisecondsPerSecond = 1000;
	/**
	 * <b>Async</b> Write a new set of statistics into the database when a user has spoken.
	 * @param {DatabaseUser} user - User that has spoken.
	 * @param {date} started - When the speech has started.
	 * @param {date} ended - When the speech has ended.
	 * @return {undefined}
	 */
	Database.prototype.writeUserStatsSpeak = async function(user, started, ended) {
		await this.connection.query(
			"INSERT INTO UserStatsSpeaking(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended]
		);
	};

	/**
	 * <b>Async</b> Write a new set of statistics into the database when a user is online.
	 * @param {DatabaseUser} user - User that has spoken.
	 * @param {date} started - When the user got online.
	 * @param {date} ended - When the user got offline.
	 * @return {undefined}
	 */
	Database.prototype.writeUserStatsOnline = async function(user, started, ended) {
		await this.connection.query(
			"INSERT INTO UserStatsOnline(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended]
		);
	};

	/**
	 * @typedef StatObjectSpeechPerHour
	 * @property {number} hour - The hour this object is representing.
	 * @property {number} amount - Amount of speech in this hour.
	 */
	/**
	 * <b>Async</b> Get statistics about how much speech per hour was produced.
	 * @return {StatObjectSpeechPerHour[]} - List of objects representing the statistics requested.
	 */
	Database.prototype.getSpokenPerHour = async function() {
		const rows = await this.connection.query(
			"SELECT HOUR(started) AS hour, SUM(TIME_TO_SEC(ended-started)) AS amount " +
			"FROM UserStatsSpeaking GROUP BY HOUR(started)"
		);
		return rows.map((elem) => ({
			hour : elem.hour,
			amount : new Date(elem.amount * millisecondsPerSecond)
		}));
	};

		/**
		 * @typedef StatObjectSpeechPerUser
		 * @property {string} user - Name of the user this object is representing.
		 * @property {number} amount - Amount of speech in this hour.
		 */
	/**
	 * <b>Async</b> Get statistics about the speech per user.
	 * @return {StatObjectSpeechPerUser[]} - List of objects representing the statistics requested.
	 */
	Database.prototype.getSpokenPerUser = async function() {
		const rows = await this.connection.query(
			"SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount " +
			"FROM UserStatsSpeaking " +
			"LEFT JOIN Users u ON user = u.id " +
			"GROUP BY user");
		return rows.map(elem => ({
			user : elem.user,
			amount : new Date(elem.amount * millisecondsPerSecond)
		}));
	};

	/**
	 * @typedef StatObjectSpeechPerWeekday
	 * @property {string} user - Name of the user this object is representing.
	 * @property {number} amount - Amount of speech in this hour.
	 */
	/**
	 * <b>Async</b> Get statistics about speech per weekday.
	 * @return {StatObjectSpeechPerWeekday[]} - List of objects representing the statistics requested.
	 */
	Database.prototype.getSpokenPerWeekday = async function() {
		const rows = await this.connection.query(
			"SELECT DAYOFWEEK(started) AS day, SUM(TIME_TO_SEC(ended-started)) AS amount " +
			"FROM UserStatsSpeaking " +
			"GROUP BY DAYOFWEEK(started)"
		);
		return rows.map(elem => ({
			day : elem.day,
			amount : new Date(elem.amount * millisecondsPerSecond)
		}));
	};
	/**
	 * @typedef StatObjectOnlinePerUser
	 * @property {string} user - Name of the user this object is representing.
	 * @property {number} amount - Amount of time the user was online in seconds.
	 */
	/**
	 * <b>Async</b> Get statistics about the online time per user.
	 * @return {StatObjectOnlinePerUser[]} - List of objects representing the statistics requested.
	 */
	Database.prototype.getOnlinePerUser = async function() {
		const rows = await this.connection.query(
			"SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount " +
			"FROM UserStatsOnline " +
			"LEFT JOIN Users u ON user = u.id " +
			"GROUP BY user"
		);
		return rows.map(elem => ({
			user : elem.user,
			amount : new Date(elem.amount * millisecondsPerSecond)
		}));
	};
};

export default UserStatsExtension;
