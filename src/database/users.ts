import { getSettings } from "./";
import { DatabaseUser } from "../types";

interface RegisterData  {
    email: string;
    password: string;
    username: string;
}
/**
 * Register a new user in the database.
 * @param user User which should be inserted into the database.
 * @return Unique id of the newly generated user.
 */
export async function registerUser(user: RegisterData, connection) {
    const result = await connection.query(
        "INSERT INTO Users(email, username, password) VALUES(?, ?, ?, ?, ?)",
        [user.email, user.username, user.password]
    );
    return result.insertId;
}

/**
 * Retrieves details about a user by his username.
 * @param username The username of the user to retrieve.
 * @return The user related to this username.
 */
export async function getUserByUsername(username: string, connection): Promise<DatabaseUser> {
    const rows = await connection.query("SELECT id FROM Users WHERE username = ?", [username]);
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
}

/**
 * Retrieves details about a user by his id.
 * @param id The id of the user to retrieve.
 * @return The user related to this id.
 */
export async function getUserById(id, connection): Promise<DatabaseUser> {
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
}

/**
 * Give (Or take with negative number) a user a specified amount of money.
 * @param user The user to manipulate the money of.
 * @param amount The amount of money to change.
 */
export async function giveUserMoney(user, amount, connection): Promise<void> {
    await connection.query("UPDATE Users SET money = money + ? WHERE id = ?", [amount, user.id]);
}

/**
 * Retrieves details about a user by his steam Id.
 * @param steamId The steamid of the user to retrieve.
 * @return The user related to this steam id.
 */
export async function getUserBySteamId(steamId, connection): Promise<DatabaseUser> {
    const rows = await connection.query("SELECT id FROM Users WHERE steamid = ?", [steamId]);
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
}

/**
 * Retrieves details about a random user.
 * @return A random user from the database.
 */
export async function getRandomUser(connection): Promise<DatabaseUser> {
    const rows = await connection.query("SELECT id FROM Users ORDER BY RAND() LIMIT 1");
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
}

/**
 * Retrieves details about a user by his steam Id.
 * @param minecraft The minecraft username of the user to retrieve.
 * @return The user related to this minecraft username.
 */
export async function getUserByMinecraftUsername(minecraft, connection): Promise<DatabaseUser> {
    const rows = await connection.query("SELECT id FROM Users WHERE minecraft = ?", [minecraft]);
    if (rows && rows.length > 0) {
        return await getUserById(rows[0].id, connection);
    }
    else {
        return;
    }
}

/**
 * Check the login data of a user.
 * @param username Username of the user to check.
 * @param passwordHash Already hashed password to compare.
 * @return Whether the username and the password matched.
 */
export async function checkLoginData(username, passwordHash, connection): Promise<boolean> {
    const rows = await connection.query(
        "SELECT id FROM Users " +
        "WHERE username = ? AND password = ?", [username, passwordHash]);
    return rows && rows.length > 0;
}

/**
 * Retrieves a list of users from the database.
 * @return All users in the whole database.
 */
export async function listUsers(connection): Promise<DatabaseUser[]> {
    const rows = await connection.query("SELECT id FROM Users");
    const promises: Promise<DatabaseUser>[] = rows.map((u) => getUserById(u.id, connection));
    return await Promise.all(promises);
}

/**
 * Counts all user in the database.
 * @return Amount of users in the database.
 */
export async function countUsers(connection): Promise<number> {
    const rows = await connection.query("SELECT COUNT(id) AS count FROM Users");
    return rows[0].count;
}
