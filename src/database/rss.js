module.exports = function(Database) {
	Database.prototype.addRSSFeed = function(url, name, callback) {
		this.pool.query("INSERT INTO RSS(url, name) VALUES (?, ?)", [url, name],
			function(err, result) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null); }
				}
			}.bind(this)
		);
	};
	Database.prototype.removeRSSFeed = function(id, callback) {
		this.pool.query("DELETE FROM RSS WHERE id = ?", [id],
			function(err, result) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null); }
				}
			}.bind(this)
		);
	};
	Database.prototype.listRSSFeeds = function(callback) {
		this.pool.query("SELECT id, url, name FROM RSS",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};
	Database.prototype.isRSSFeedEntryKnown = function(hash, callback) {
		this.pool.query("SELECT hash FROM KnownRSSEntries WHERE hash = ?", [hash],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows.length > 0);
				}
			}.bind(this)
		);
	};
	Database.prototype.addKnownRSSFeedEntry = function(hash, url, callback) {
		this.pool.query("INSERT INTO KnownRSSEntries(hash, url, seen) VALUES(?, ?, ?)", [hash, url, new Date()],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null); }
				}
			}.bind(this)
		);
	};
};
