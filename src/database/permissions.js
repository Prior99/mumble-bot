/**
 * Extends the database with methods for permission handling.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabasePermissions = function(Database) {
	/**
	 * Checks whether a user with the given id has a certain permission.
	 * @param {number} userid - Id of the user to check.
	 * @param {string} permission - Permission to look for.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.hasPermission = function(userid, permission, callback) {
		this.pool.query("SELECT id FROM UserPermissions WHERE user = ? AND permission = ?",
			[userid, permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows && rows.length > 0);
				}
			}.bind(this)
		);
	};

	/**
	 * Grants a permission to a user without checking.
	 * @param {number} userid - Id of the user to grant the permission to.
	 * @param {string} permission - Permission to grant.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.grantPermission = function(userid, permission, callback) {
		this.pool.query("INSERT IGNORE INTO UserPermissions (user, permission) VALUES (?, ?)",
			[userid, permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};

	/**
	 * Revokes a permission from a user without performing any checks.
	 * @param {number} userid - Id of the user to revoke the permission from.
	 * @param {string} permission - Permission to revoke.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.revokePermission = function(userid, permission, callback) {
		this.pool.query("DELETE FROM UserPermissions WHERE user = ? AND permission = ?",
			[userid, permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};

	/**
	 * Get details about a certain permission.
	 * @param {string} permission - Permission to look up.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.getPermission = function(permission, callback) {
		this.pool.query("SELECT id, name, description, icon FROM Permissions",
			[permission], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows[0]);
				}
			}.bind(this)
		);
	};
	/**
	 * Get a list of all permissions.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.listPermissions = function(callback) {
		this.pool.query("SELECT id, name, description, icon FROM Permissions", function(err, rows) {
			if(this._checkError(err, callback)) {
				callback(null, rows);
			}
		}.bind(this));
	};
};

export default DatabasePermissions;
