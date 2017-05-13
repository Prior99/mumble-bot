import { getSettings } from "./";

/**
 * Register a new user in the database.
 * @param {object} user - User which should be inserted into the database.
 * @param {string} user.email - E-Mail address of the new user.
 * @param {string} user.username - The new users username.
 * @param {string} user.password - The previously hashed password.
 * @param {string} user.steamid - Steam64 id of the user.
 * @param {string} user.minecraft - The users nickname in minecraft.
 * @return {number} - Unique id of the newly generated user.
 */
export async function registerUser(user, connection) {
    const result = await connection.query(
        "INSERT INTO Users(email, username, password, steamid, minecraft) VALUES(?, ?, ?, ?, ?)",
        [user.email, user.username, user.password, user.steamid, user.minecraft]
    );
    return result.insertId;
};

/**
 * Retrieves details about a user by his username.
 * @param {string} username - The username of the user to retrieve.
 * @return {DatabaseUser} - The user related to this username.
 */
export async function getUserByUsername(username, connection) {
    const rows = await connection.query("SELECT id FROM Users WHERE username = ?", [username]);
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
};

/**
 * A user from the database.
 * @typedef {object} DatabaseUser
 * @property {string} minecraft - The minecraft username of the user.
 * @property {string} username - The username of this user.
 * @property {string} steamid - The Steam64 id of the user.
 * @property {object} settings - The custom settings of the user are stored key-value-wise in this object.
 */

/**
 * Retrieves details about a user by his id.
 * @param {number} id - The id of the user to retrieve.
 * @return {DatabaseUser} - The user related to this id.
 */
export async function getUserById(id, connection) {
    const rows = await connection.query(
        "SELECT " +
        "u.minecraft AS minecraft, " +
        "u.id AS id, " +
        "u.username as username, " +
        "u.steamid AS steamid, " +
        "u.money AS money " +
        "FROM Users u " +
        "WHERE u.id = ?",
        [id]
    );
    if (rows && rows.length > 0) {
        const user = rows[0];
        const settings = await getSettings(user, connection);
        user.settings = settings;
        return user;
    }
    else {
        return;
    }
};

/**
 * Give (Or take with negative number) a user a specified amount of money.
 * @param {DatabaseUser} user - The user to manipulate the money of.
 * @param {number} amount - The amount of money to change.
 * @return {undefined}
 */
export async function giveUserMoney(user, amount, connection) {
    await connection.query("UPDATE Users SET money = money + ? WHERE id = ?", [amount, user.id]);
};

/**
 * Retrieves details about a user by his steam Id.
 * @param {string} steamId - The steamid of the user to retrieve.
 * @return {DatabaseUser} - The user related to this steam id.
 */
export async function getUserBySteamId(steamId, connection) {
    const rows = await connection.query("SELECT id FROM Users WHERE steamid = ?", [steamId]);
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
};

/**
 * Retrieves details about a random user.
 * @return {DatabaseUser} - A random user from the database.
 */
export async function getRandomUser(connection) {
    const rows = await connection.query("SELECT id FROM Users ORDER BY RAND() LIMIT 1");
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
};

/**
 * Retrieves details about a user by his steam Id.
 * @param {string} minecraft - The minecraft username of the user to retrieve.
 * @return {DatabaseUser} - The user related to this minecraft username.
 */
export async function getUserByMinecraftUsername(minecraft, connection) {
    const rows = await connection.query("SELECT id FROM Users WHERE minecraft = ?", [minecraft]);
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
};

/**
 * Check the login data of a user.
 * @param {string} username - Username of the user to check.
 * @param {string} passwordHash - Already hashed password to compare.
 * @return {boolean} - Whether the username and the password matched.
 */
export async function checkLoginData(username, passwordHash, connection) {
    const rows = await connection.query(
        "SELECT id FROM Users " +
        "WHERE username = ? AND password = ?", [username, passwordHash]);
    return rows && rows.length > 0;
};

/**
 * Retrieves a list of users from the database.
 * @return {DatabaseUser[]} - All users in the whole database.
 */
export async function listUsers(connection) {
    const rows = await connection.query("SELECT id FROM Users");
    const users = await Promise.all(rows.map((u) => getUserById(u.id, connection)));
    return users;
};

/**
 * Counts all user in the database.
 * @return {number} - Amount of users in the database.
 */
export async function countUsers(connection) {
    const rows = await connection.query("SELECT COUNT(id) AS count FROM Users");
    return rows[0].count;
};

