/**
 * Extends the database with methods for handling the log.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseLog = function(Database) {
	Database.prototype.listLog = async function(callback) {
		const rows = await this.pool.query(
			"SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500"
		);
		return rows;
	}
}

export default DatabaseLog;
