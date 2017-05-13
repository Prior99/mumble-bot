import { getUserById } from "./";
/**
 * Will return an array containing all mumble user ids of mumble users which
 * are linked to users in this bot and their counterparts usernames.
 * @return {MumbleDatabaseUser[]} - The mumble users in the database.
 */
export async function getLinkedMumbleUsers(connection) {
    const rows = await connection.query(
        "SELECT m.mumbleId AS id, u.username AS username " +
        "FROM MumbleUsers m " +
        "LEFT JOIN Users u ON u.id = m.user"
    );
    return rows;
};

/**
 * Returns all mumble user ids of mumble users which are linked to the specified user.
 * @param {string} username - Name of the user of which the ids should be fetched.
 * @return {MumbleDatabaseUser[]} - The linked users of the requested database user.
 */
export async function getLinkedMumbleUsersOfUser(username, connection) {
    const rows = await connection.query(
        "SELECT m.mumbleId AS id, u.username AS username " +
        "FROM MumbleUsers m " +
        "LEFT JOIN Users u ON u.id = m.user WHERE u.username = ?",
        [username]
    );
    return rows;
};

/**
 * Links a mumble user to a user in this bot.
 * @param {number} id - Id of the mumble user to link.
 * @param {string} username - User to which the mumble user should be linked.
 * @return {undefined}
 */
export async function linkMumbleUser(id, username, connection) {
    await connection.query(
        "INSERT INTO MumbleUsers(mumbleId, user) VALUES(?, (SELECT id FROM Users WHERE username = ?))",
        [id, username]
    );
}

/**
 * Returns the full user to which a mumble user id is linked.
 * @param {number} id - Id of the mumble user to check.
 * @return {DatabaseUser} - User in the database which is linked with the given mumble users id.
 */
export async function getLinkedUser(id, connection) {
    const rows = await connection.query("SELECT user FROM MumbleUsers WHERE mumbleId = ?", [id]);
    if (rows.length > 0) {
        const user = await getUserById(rows[0].user, connection);
        return user;
    }
    else {
        return;
    }
}

