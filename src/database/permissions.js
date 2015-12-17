/**
 * Extends the database with methods for permission handling.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const DatabasePermissions = function(Database) {
	/**
	 * <b>Async</b> Checks whether a user with the given id has a certain permission.
	 * @param {number} userid - Id of the user to check.
	 * @param {string} permission - Permission to look for.
	 * @return {boolean} - Whether the user has the requested permission.
	 */
	Database.prototype.hasPermission = async function(userid, permission) {
		const rows = await this.pool.query("SELECT id FROM UserPermissions WHERE user = ? AND permission = ?");
		return rows && rows.length > 0;
	};

	/**
	 * <b>Async</b> Grants a permission to a user without checking.
	 * @param {number} userid - Id of the user to grant the permission to.
	 * @param {string} permission - Permission to grant.
	 * @return {undefined}
	 */
	Database.prototype.grantPermission = async function(userid, permission) {
		await this.pool.query("INSERT IGNORE INTO UserPermissions (user, permission) VALUES (?, ?)",
			[userid, permission]
		);
	};

	/**
	 * <b>Async</b> Revokes a permission from a user without performing any checks.
	 * @param {number} userid - Id of the user to revoke the permission from.
	 * @param {string} permission - Permission to revoke.
	 * @return {undefined}
	 */
	Database.prototype.revokePermission = async function(userid, permission) {
		await this.pool.query("DELETE FROM UserPermissions WHERE user = ? AND permission = ?",
			[userid, permission]
		);
	};
	/**
	 * A single permission as stored in the database.
	 * @typedef Permission
	 * @property {string} id - Unique id of the permission as unique string.
	 * @property {string} name - Human readable name of the permission.
	 * @property {string} description - Human readable description of the permission.
	 * @property {string} icon - Font Awesome icon class of this permission.
	 */
	/**
	 * <b>Async</b> Get details about a certain permission.
	 * @param {string} permission - Permission to look up.
	 * @return {Permission} - The permission to get the details of.
	 */
	Database.prototype.getPermission = async function(permission) {
		const rows = await this.pool.query("SELECT id, name, description, icon FROM Permissions WHERE id = ?",
			[permission]);
		if(rows.length > 0) {
			return rows[0];
		}
		else {
			return null;
		}
	};
	/**
	 * <b>Async</b> Get a list of all permissions.
	 * @return {Permission[]} - The permission to get the details of.
	 */
	Database.prototype.listPermissions = async function() {
		const rows = await this.pool.query("SELECT id, name, description, icon FROM Permissions");
		return rows;
	};
};

export default DatabasePermissions;
