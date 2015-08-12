module.exports = function(Database) {
	Database.prototype.listLog = function(callback) {
		this.pool.query("SELECT level, message, `timestamp` FROM Log ORDER BY `timestamp` DESC LIMIT 500", function(err, rows) {
			if(this._checkError(err, callback)) {
				callback(null, rows);
			}
		}.bind(this));
	};
};
