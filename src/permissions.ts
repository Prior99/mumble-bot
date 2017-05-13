import * as Winston from "winston";
import { hasPermission, getPermission, listPermissions, grantPermission, revokePermission } from "./database";

/**
 * Handles permissions in the bot.
 * This is basically just a nicer-to-use interface to the database.
 */
class Permissions {
    private database: any;
    /**
     * @param {Database} database - The database of the bot to use.
     * @constructor
     */
    constructor(database) {
        this.database = database;
        Winston.info("Module started: Permissions");
    }

    /**
     * Checks whether a user has the given permission.
     * @param {User} user - User to check the permission of.
     * @param {string} permission - Permission to check.
     * @returns {boolean} - Whether the permission was granted or whether not.
     */
    async hasPermission(user, permission) {
        if (!user) {
            return false;
        }
        try {
            const has = await hasPermission(user.id, permission, this.database);
            return has;
        }
        catch (err) {
            Winston.error("Could not check whether user has permission", err);
            return false;
        }
    }

    /**
     * Checks whether a user has the given permission and executes the callback if
     * does. Otherwise logs a warning.
     * @param {User} user - User to check the permission of.
     * @param {string} permission - Permission to check.
     * @param {VoidCallback} callback - This callback is only called when the permission was available.
     * @returns {undefined}
     */
    requirePermission(user, permission, callback) {
        if (!user) {
            Winston.warn("Unknown user tried to execute something which required permission \"" + permission + "\"");
            return;
        }
        else {
            this.hasPermission(user, permission);
        }
    }

    /**
     * Grants the permission to a user. If the issuer is null or undefined, no
     * checks will be performed. If the issuer is defined, a check will be performed
     * whether the issuer can grant the requested permission at all.
     * @param {User} issuer - User that issues this command.
     * @param {User} user - User to grant the permission to.
     * @param {string} permission - Permission to grant to the user.
     * @returns {boolean} - True when the permission was granted and false otherwise.
     */
    async grantPermission(issuer, user, permission) {
        const grant = await this.hasPermission(issuer, "grant");
        const perm = await this.hasPermission(issuer, permission);
        if (!issuer || (grant && perm)) {
            try {
                await grantPermission(user.id, permission, this.database);
                Winston.info("Permission \"" + permission + "\" was granted to user " + user.username);
                return true;
            }
            catch (err) {
                Winston.error("Error when granting permission \"" + permission + "\" to user "
                    + user.username + ".", err);
                return false;
            }
        }
        else {
            return false;
        }
    }

    /**
     * Revokes a certain permission from a user. If the issuer is null or undefined, no
     * checks will be performed. If the issuer is defined, a check will be performed
     * whether the issuer can revoke the requested permission at all.
     * @param {User} issuer - User that issues this command.
     * @param {User} user - User to revoke the permission from.
     * @param {string} permission - Permission to grant to the user.
     * @returns {boolean} - True when the permission was revoked and false otherwise.
     */
    async revokePermission(issuer, user, permission) {
        const grant = await this.hasPermission(issuer, "grant");
        const perm = await this.hasPermission(issuer, permission);
        if (!issuer || (grant && perm)) {
            try {
                await revokePermission(user.id, permission, this.database);
                Winston.info("Permission \"" + permission + "\" was revoked from user " + user.username);
                return true;
            }
            catch (err) {
                Winston.error("Error when revoking permission \"" + permission + "\" from user "
                    + user.username + " by user " + issuer.username + ".", err);
                return false;
            }
        }
        else {
            return false;
        }
    }
    /**
     * This object holds all information about a specific permission.
     * @typedef Permission
     * @property {number} id - Unique id of the permission.
     * @property {string} name - Name of the permission.
     * @property {string} description - Human readable description.
     * @property {string} icon - Fontawesome icon class for this permission.
     */
    /**
     * Retrieve information about a given permission.
     * @param {string} permission - Permission to gather information about.
     * @returns {Permission} - An object holding information about the permission that was requested.
     */
    async getPermission(permission) {
        try {
            const databasePermission = await getPermission(permission, this.database);
            return databasePermission;
        }
        catch (err) {
            Winston.error("Error when getting permission \"" + permission + "\".", err);
            return;
        }
    }

    /**
     * Retrieve an array containing all permissions known to this bot.
     * @returns {Permission[]} - An array holding objects holding information about the permissions.
     */
    async listPermissions() {
        try {
            const permissions = await listPermissions(this.database);
            return permissions;
        }
        catch (err) {
            Winston.error("Error when listing permissions.", err);
            return [];
        }
    }

    /**
     * Grants all known permissions to one user. If the issuer is null or undefined
     * no checking will be performed. Else it will be checked if the issuer can
     * grant the requested permissions at all and only those he can grant will be
     * granted.
     * @param {User} issuer - User that issued this command.
     * @param {User} user - User to grant the permissions to.
     * @param {GrantPermissionCallback} callback - Called once all permissions were processed.
     * @returns {boolean} - If everything has gone right.
     */
    async grantAllPermissions(issuer, user) {
        const permissions = await this.listPermissions();
        let okay = true;
        while (permissions.length) {
            const permission = permissions.shift();
            const ok = await this.grantPermission(issuer, user, permission.id);
            if (!ok) {
                okay = false;
            }
        }
        return okay;
    }

    /**
     * Lists all permissions from the view of a single user. Information about
     * whether the user has the permission and whether the issuer can grant it will be added.
     * @param {User} issuer - User that issued the command and of which it should be
     *                 checked whether he can grant the permissions.
     * @param {User} user - User of which it should be checked whether he has the permissions.
     * @returns {Permission[]} - List of all permissions for a user. Each permission object has two additional
     *                           properties: "has" which indicates whether the user has the permission and "canGrant"
     *                           to determine whether the issuer can grant the permission.
     */
    async listPermissionsForUser(issuer, user) {
        const array = [];
        const issuerCanGrant = await this.hasPermission(issuer, "grant");
        const permissions = await this.listPermissions();
        while (permissions.length) {
            const permission = permissions.shift();
            let has = await this.hasPermission(user, permission.id);
            permission.granted = has;
            has = await this.hasPermission(issuer, permission.id);
            permission.canGrant = has && issuerCanGrant;
            array.push(permission);
        }
        return array;
    }
    /**
     * Returns an object with the permissions as keys and a boolean designating whether
     * the user has or does not have the permission.
     * (for example: { "permissionA" : true, "permissionB" : false, ... })
     * @param {User} user - The user to fetch the object for.
     * @returns {object} - The object as described.
     */
    async listPermissionsAssocForUser(user) {
        const obj = {};
        const permissions = await this.listPermissions();
        while (permissions.length) {
            const permission = permissions.shift();
            const has = await this.hasPermission(user, permission.id);
            obj[permission.id] = has;
        }
        return obj;
    }
}

export default Permissions;
