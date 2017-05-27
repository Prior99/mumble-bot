import { DatabaseUser, Settings } from "../types";

/**
 * Get get the specified setting from to the given user.
 * @param user User to fetch the setting from.
 * @param setting Settings key to fetch the value from.
 * @return The value in its unchanged string representation as taken from the database.
 */
export async function getSetting(user, setting, connection): Promise<string> {
    const rows = await connection.query("SELECT value FROM UserSettings WHERE user = ? AND setting = ?",
        [user.id, setting]
    );
    if (rows && rows.length > 0) {
        return rows[0].value;
    }
    else {
        return;
    }
}

/**
 * Get all settings of a specified user as an object.
 * @param user The user to get the settings from.
 * @return An object with each settings key as key and the corresponding value (parsed from json) as value.
 */
export async function getSettings(user: DatabaseUser, connection): Promise<Settings> {
    const rows = await connection.query("SELECT setting, value FROM UserSettings WHERE user = ?", [user.id]);
    return rows.reduce((result, row) => {
        return {
            ...result,
            [row.setting]: JSON.parse(row.value)
        };
    }, {});
}

/**
 * Set a specified setting to the specified value.
 * @param user User to change the settings of.
 * @param setting The setting to change.
 * @param value The value as already serialized string to store in the database.
 */
export async function setSetting(user: DatabaseUser, setting: string, value: string, connection): Promise<void> {
    await connection.query(
        "INSERT INTO UserSettings(user, setting, value) " +
        "VALUES(?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE value = VALUES(value)", [user.id, setting, value]
    );
}
