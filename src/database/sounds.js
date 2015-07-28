module.exports = function(Database) {
	Database.prototype.addSound = function(name, callback) {
		this.pool.query("INSERT INTO Sounds(name) VALUES(?)",
			[name], function(err, result) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, result.insertId); }
				}
			}.bind(this)
		);
	};
	Database.prototype.listSounds = function(callback) {
		this.pool.query("SELECT id, name, used FROM Sounds ORDER BY used DESC",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null, rows); }
				}
			}.bind(this)
		);
	};
	Database.prototype.usedSound = function(id, callback) {
		this.pool.query("UPDATE Sounds SET used = used +1",
			[id], function(err) {
				if(this._checkError(err, callback)) {
					if(callback) { callback(null); }
				}
			}.bind(this)
		);
	};
};
