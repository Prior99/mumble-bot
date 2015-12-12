class Database {
	listLog(callback) {
		this.pool.query("SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500",
			(err, rows) => {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}
		);
	}
}

module.exports = Database;
