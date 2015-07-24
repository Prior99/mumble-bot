module.exports = function(Database) {
	Database.prototype.enterAutoComplete = function(sentence, callback) {
		this.pool.query("INSERT INTO AutoComplete(sentence) VALUES (?) ON DUPLICATE KEY UPDATE used = used + 1", [sentence],
			function(err, result) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};
	Database.prototype.lookupAutoComplete = function(part, callback) {
		this.pool.query("SELECT id, sentence, used FROM AutoComplete WHERE sentence LIKE ? ORDER BY used DESC LIMIT 10", ["%" + part + "%"],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};
};
