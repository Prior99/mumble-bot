module.exports = function(Database) {
	Database.prototype.registerUser = function(user, callback) {
		this.pool.query("INSERT INTO Users(email, username, password, identifier, steamid, minecraft) VALUES(?, ?, ?, ?, ?, ?)",
			[user.email, user.username, user.password, user.identifier, user.steamid, user.minecraft], function(err, result) {
				if(this._checkError(err, callback)) {
					callback(null, result.insertId);
				}
			}.bind(this)
		);
	};
	Database.prototype.getUserByUsername = function(username, callback) {
		this.pool.query("SELECT u.minecraft AS minecraft, u.id AS id, u.username as username, u.password AS password, i.identifier AS identifier, u.steamid AS steamid FROM Users u LEFT JOIN Identifiers i ON u.identifier = i.id WHERE u.username = ?",
			[username], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows[0]);
				}
			}.bind(this)
		);
	};
	Database.prototype.getUserById = function(id, callback) {
		this.pool.query("SELECT u.minecraft AS minecraft, u.id AS id, u.username as username, u.password AS password, i.identifier AS identifier, u.steamid AS steamid FROM Users u LEFT JOIN Identifiers i ON u.identifier = i.id WHERE u.id = ?",
			[id], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows[0]);
				}
			}.bind(this)
		);
	};
	Database.prototype.checkLoginData = function(username, passwordHash, callback) {
		this.pool.query("SELECT id FROM Users WHERE username = ? AND password = ?", [username, passwordHash],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows.length > 0);
				}
			}.bind(this)
		);
	};
	Database.prototype.getFreeIdentifiers = function(callback) {
		this.pool.query("SELECT id, identifier FROM Identifiers WHERE id NOT IN (SELECT identifier FROM Users) ORDER BY Identifiers.id",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};
};
