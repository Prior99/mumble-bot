/**
 * A user from the database.
 */
export interface DatabaseUser {
    id: number;
    /**
     * The minecraft username of the user.
     */
    minecraft: string;
    /**
     * The username of this user.
     */
    username: string;
    /**
     * The Steam64 id of the user.
     */
    steamid: string;
    /**
     * The custom settings of the user are stored key-value-wise in this object.
     */
    settings: any;
}
