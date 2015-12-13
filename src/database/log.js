/**
 * Extends the database with methods for handling the log.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabaseLog = function(Database) {
	Database.prototype.listLog = function(callback) {
		this.pool.query("SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500",
			(err, rows) => {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}
		);
	}
}

export default DatabaseLog;
