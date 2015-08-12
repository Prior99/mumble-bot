module.exports = function(Database) {
	/**
	 * Insert a new bass "effect" word into the database.
	 * @param{string} effect - Word to insert
	 * @param callback - Called when the query is done.
	 */
	Database.prototype.addBassEffect = function(effect, callback) {
		this.pool.query("INSERT INTO BassEffects(effect) VALUES (?)", [effect],
			function(err, result) {
				if(this._checkError(err, callback)) {
					callback(null, result.insertId);
				}
			}.bind(this)
		);
	};

	/**
	 * Lists all bass effect words in the database.
	 * @param callback - Called when the query is done.
	 */
	Database.prototype.listBassEffects = function(callback) {
		this.pool.query("SELECT effect FROM BassEffects",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					var arr = [];
					for(var i in rows) {
						arr.push(rows[i].effect);
					}
					callback(null, arr);
				}
			}.bind(this)
		);
	};
};
