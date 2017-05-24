import { Permission } from "../types";

/**
 * Checks whether a user with the given id has a certain permission.
 * @param userid Id of the user to check.
 * @param permission Permission to look for.
 * @return Whether the user has the requested permission.
 */
export async function hasPermission(userid: number, permission, connection) {
    const rows = await connection.query("SELECT id FROM UserPermissions WHERE user = ? AND permission = ?",
        [userid, permission]
    );
    return rows && rows.length > 0;
}

/**
 * Grants a permission to a user without checking.
 * @param userid Id of the user to grant the permission to.
 * @param permission Permission to grant.
 */
export async function grantPermission(userid: number, permission, connection) {
    await connection.query("INSERT IGNORE INTO UserPermissions (user, permission) VALUES (?, ?)",
        [userid, permission]
    );
}

/**
 * Revokes a permission from a user without performing any checks.
 * @param userid Id of the user to revoke the permission from.
 * @param permission Permission to revoke.
 */
export async function revokePermission(userid: number, permission, connection) {
    await connection.query("DELETE FROM UserPermissions WHERE user = ? AND permission = ?",
        [userid, permission]
    );
}

/**
 * Get details about a certain permission.
 * @param permission Permission to look up (Id).
 * @return The permission to get the details of.
 */
export async function getPermission(permission: number, connection): Promise<Permission> {
    const rows = await connection.query("SELECT id, name, description, icon FROM Permissions WHERE id = ?",
        [permission]);
    if (rows.length > 0) {
        return rows[0];
    }
    else {
        return;
    }
}

/**
 * Get a list of all permissions.
 * @return The permission to get the details of.
 */
export async function listPermissions(connection): Promise<Permission[]> {
    const rows = await connection.query("SELECT id, name, description, icon FROM Permissions");
    return rows;
}
