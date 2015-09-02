module.exports = function(Database) {
	Database.prototype.addRSSFeed = function(url, callback) {
		this.pool.query("INSERT INTO RSS(url) VALUES (?)", [url],
			function(err, result) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};
	Database.prototype.removeRSSFeed = function(id, callback) {
		this.pool.query("DELETE FROM RSS WHERE id = ?", [id],
			function(err, result) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};
	Database.prototype.listRSSFeeds = function(callback) {
		this.pool.query("SELECT id, url FROM RSS",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};
};
