/**
 * A single permission as stored in the database.
 */
export interface Permission {
    /**
     * Unique id of the permission as unique string.
     */
    id: string;
    /**
     * Human readable name of the permission.
     */
    name: string;
    /**
     * Human readable description of the permission.
     */
    description: string;
    /**
     * Font Awesome icon class of this permission.
     */
    icon: string;
}

export interface AssociatedPermission {
    [permission: string]: boolean;
}

export interface UserPermission extends Permission {
    granted: boolean;
    canGrant: boolean;
}
