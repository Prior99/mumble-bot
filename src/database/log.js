/**
 * Extends the database with methods for handling the log.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const LogExtension = function(Database) {
	/**
	 * One entry in the bots log.
	 * @typedef LogEntry
	 * @property {string} level - Loglevel (Consult winston for this.) error, warning, verbose, info, etc...
	 * @property {string} message - The message that was logged.
	 * @property {date} timestamp - The date and time this was logged.
	 */
	/**
	 * <b>Async</b> List the last 500 entries of the servers log.
	 * @return {LogEntry[]} - Last 500 log entries.
	 */
	Database.prototype.listLog = async function() {
		const rows = await this.connection.query(
			"SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500"
		);
		return rows;
	}
}

export default LogExtension;
