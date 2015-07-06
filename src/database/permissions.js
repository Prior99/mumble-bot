module.exports = function(Database) {
	Database.prototype.hasPermission = function(userid, permission, callback) {
		this.pool.query("SELECT id FROM UserPermissions WHERE user = ? AND permission = ?",
			[userid, permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows && rows.length > 0);
				}
			}.bind(this)
		);
	};
	Database.prototype.grantPermission = function(userid, permission, callback) {
		this.pool.query("INSERT IGNORE INTO UserPermissions (user, permission) VALUES (?, ?)",
			[userid, permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};
	Database.prototype.revokePermission = function(userid, permission, callback) {
		this.pool.query("DELETE FROM UserPermissions WHERE user = ? AND permission = ?",
			[userid, permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};
	Database.prototype.getPermission = function(permission, callback) {
		this.pool.query("SELECT id, name, description, icon FROM Permissions",
			[permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows[0]);
				}
			}.bind(this)
		);
	};
	Database.prototype.listPermissions = function(callback) {
		this.pool.query("SELECT id, name, description, icon FROM Permissions", function(err, rows) {
			if(this._checkError(err, callback)) {
				callback(null, rows);
			}
		}.bind(this));
	};
};
