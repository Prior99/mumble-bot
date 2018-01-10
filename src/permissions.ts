import * as Winston from "winston";
import { component, inject } from "tsdi";
import { Connection } from "typeorm";
import { Permission, DatabaseUser } from "./models";

export const permissions = new Map<string, Permission>();

function registerPermission(permission: Permission) {
    permissions.set(permission.id, new Permission(permission));
}

registerPermission({
    id: "login",
    name: "Login",
    description: "Login to the bot.",
    icon: "sign-in"
});

registerPermission({
    id: "grant",
    name: "Grant Permissions",
    description: "Grant permissions to other users.",
    icon: "legal"
});

registerPermission({
    id: "upload-music",
    name: "Upload sounds",
    description: "Upload sounds to the bot.",
    icon: "upload"
});

registerPermission({
    id: "be-quiet",
    name: "Mute bot",
    description: "Mute the bot.",
    icon: "bell-slash"
});

registerPermission({
    id: "log",
    name: "Show Log",
    description: "View the log of the bot.",
    icon: "file-text"
});


/**
 * Handles permissions in the bot.
 * This is basically just a nicer-to-use interface to the database.
 */
@component
export class Permissions {
    @inject private db: Connection;
    /**
     * Checks whether a user has the given permission and executes the callback if
     * does. Otherwise logs a warning.
     * @param user - User to check the permission of.
     * @param permission - Permission to check.
     * @param callback - This callback is only called when the permission was available.
     * @returns {undefined}
     */
    public requirePermission(user, permission, callback) {
        if (!user) {
            Winston.warn(`Unknown user tried to execute something which required permission "${permission}"`);
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
    public async grantPermission(issuer, user, permission) {
        const grant = await this.hasPermission(issuer, "grant");
        const perm = await this.hasPermission(issuer, permission);
        if (!issuer || (grant && perm)) {
            try {
                await grantPermission(user.id, permission, this.database);
                Winston.info(`Permission "${permission}" was granted to user ${user.username}`);
                return true;
            }
            catch (err) {
                Winston.error(`Error when granting permission "${permission}" to user ${user.username}.`, err);
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
     * @param issuer User that issues this command.
     * @param user User to revoke the permission from.
     * @param permission Permission to grant to the user.
     * @returns True when the permission was revoked and false otherwise.
     */
    public async revokePermission(issuer: number, user: number, permission: PermissionName): Promise<boolean> {
        const grant = await this.hasPermission(issuer, "grant");
        const perm = await this.hasPermission(issuer, permission);
        if (!issuer || (grant && perm)) {
            try {
                await revokePermission(user, permission, this.database);
                Winston.info(`Permission "${permission}" was revoked from user #${user}`);
                return true;
            }
            catch (err) {
                Winston.error(
                    `Error when revoking permission "${permission}" from user "${user} by user "${issuer}".`, err
                );
                return false;
            }
        }
        else {
            return false;
        }
    }
    /**
     * Retrieve information about a given permission.
     * @param permission Permission to gather information about.
     * @returns An object holding information about the permission that was requested.
     */
    public async getPermission(permission): Promise<Permission> {
        try {
            const databasePermission = await getPermission(permission, this.database);
            return databasePermission;
        }
        catch (err) {
            Winston.error(`Error when getting permission "${permission}".`, err);
            return;
        }
    }

    /**
     * Retrieve an array containing all permissions known to this bot.
     * @returns An array holding objects holding information about the permissions.
     */
    public async listPermissions(): Promise<Permission[]> {
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
     * @param issuer User that issued this command.
     * @param user User to grant the permissions to.
     * @param callback Called once all permissions were processed.
     * @returns If everything has gone right.
     */
    public async grantAllPermissions(issuer: number, user: number): Promise<boolean> {
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
     * @param issuer User that issued the command and of which it should be
     *   checked whether he can grant the permissions.
     * @param user User of which it should be checked whether he has the permissions.
     * @returns List of all permissions for a user. Each permission object has two additional
     *   properties: "has" which indicates whether the user has the permission and "canGrant"
     *   to determine whether the issuer can grant the permission.
     */
    public async listPermissionsForUser(issuer: number, user: number): Promise<UserPermission[]> {
        const array = [];
        const issuerCanGrant = await this.hasPermission(issuer, "grant");
        const permissions = await this.listPermissions();
        while (permissions.length) {
            const permission = permissions.shift();
            array.push({
                ...permission,
                granted: await this.hasPermission(user, permission.id as PermissionName),
                canGrant: await this.hasPermission(issuer, permission.id as PermissionName) && issuerCanGrant
            });
        }
        return array;
    }
    /**
     * Returns an object with the permissions as keys and a boolean designating whether
     * the user has or does not have the permission.
     * (for example: { "permissionA" : true, "permissionB" : false, ... })
     * @param user The user to fetch the object for.
     * @returns The object as described.
     */
    public async listPermissionsAssocForUser(user: number): Promise<AssociatedPermission> {
        const obj = {};
        const permissions = await this.listPermissions();
        while (permissions.length) {
            const permission = permissions.shift();
            const has = await this.hasPermission(user, permission.id as PermissionName);
            obj[permission.id] = has;
        }
        return obj;
    }
}
