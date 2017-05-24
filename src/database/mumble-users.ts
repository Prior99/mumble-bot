import { MumbleDatabaseUser } from "../types/mumble-database-users";
import { getUserById } from ".";

/**
 * Will return an array containing all mumble user ids of mumble users which
 * are linked to users in this bot and their counterparts usernames.
 * @return The mumble users in the database.
 */
export async function getLinkedMumbleUsers(connection): Promise<number[]> {
    const rows = await connection.query(
        "SELECT m.mumbleId AS id " +
        "FROM MumbleUsers m " +
        "LEFT JOIN Users u ON u.id = m.user"
    );
    return rows.map(row => row.id);
}

/**
 * Returns all mumble user ids of mumble users which are linked to the specified user.
 * @param id id of the user of which the ids should be fetched.
 * @return The linked users of the requested database user.
 */
export async function getLinkedMumbleUsersOfUser(id: number, connection): Promise<MumbleDatabaseUser[]> {
    const rows = await connection.query(
        "SELECT m.mumbleId AS id, u.username AS username " +
        "FROM MumbleUsers m " +
        "LEFT JOIN Users u ON u.id = m.user WHERE u.id = ?",
        [id]
    );
    return rows;
}

/**
 * Links a mumble user to a user in this bot.
 * @param mumbleId Id of the mumble user to link.
 * @param userId Id of the user to which the mumble user should be linked.
 */
export async function linkMumbleUser(mumbleId: number, userId: number, connection): Promise<void> {
    await connection.query(
        "INSERT INTO MumbleUsers(mumbleId, user) VALUES(?, ?)",
        [mumbleId, userId]
    );
}

/**
 * Returns the full user to which a mumble user id is linked.
 * @param id Id of the mumble user to check.
 * @return User in the database which is linked with the given mumble users id.
 */
export async function getLinkedUser(id: number, connection) {
    const rows = await connection.query("SELECT user FROM MumbleUsers WHERE mumbleId = ?", [id]);
    if (rows.length > 0) {
        const user = await getUserById(rows[0].user, connection);
        return user;
    }
    else {
        return;
    }
}
