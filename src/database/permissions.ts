/**
 * <b>Async</b> Checks whether a user with the given id has a certain permission.
 * @param {number} userid - Id of the user to check.
 * @param {string} permission - Permission to look for.
 * @return {boolean} - Whether the user has the requested permission.
 */
export async function hasPermission(userid, permission, connection) {
    const rows = await connection.query("SELECT id FROM UserPermissions WHERE user = ? AND permission = ?",
        [userid, permission]
    );
    return rows && rows.length > 0;
};

/**
 * <b>Async</b> Grants a permission to a user without checking.
 * @param {number} userid - Id of the user to grant the permission to.
 * @param {string} permission - Permission to grant.
 * @return {undefined}
 */
export async function grantPermission(userid, permission, connection) {
    await connection.query("INSERT IGNORE INTO UserPermissions (user, permission) VALUES (?, ?)",
        [userid, permission]
    );
};

/**
 * <b>Async</b> Revokes a permission from a user without performing any checks.
 * @param {number} userid - Id of the user to revoke the permission from.
 * @param {string} permission - Permission to revoke.
 * @return {undefined}
 */
export async function revokePermission(userid, permission, connection) {
    await connection.query("DELETE FROM UserPermissions WHERE user = ? AND permission = ?",
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
export async function getPermission(permission, connection) {
    const rows = await connection.query("SELECT id, name, description, icon FROM Permissions WHERE id = ?",
        [permission]);
    if (rows.length > 0) {
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
export async function listPermissions(connection) {
    const rows = await connection.query("SELECT id, name, description, icon FROM Permissions");
    return rows;
};

