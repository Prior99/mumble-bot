import { is, scope, specify, uuid } from "hyrest";

import { world } from "../scopes";
import { PermissionAssociation } from ".";

/**
 * A single permission as stored in the database.
 */
export class Permission {
    constructor(permission?: Permission) {
        if (permission) {
            this.id = permission.id;
            this.name = permission.name;
            this.description = permission.description;
            this.icon = permission.icon;
        }
    }

    @is() @scope(world)
    public id?: string;
    /**
     * Human readable name of the permission.
     */
    @is() @scope(world)
    public name?: string;

    /**
     * Human readable description of the permission.
     */
    @is() @scope(world)
    public description?: string;

    /**
     * Font Awesome icon class of this permission.
     */
    @is() @scope(world)
    public icon?: string;
}
