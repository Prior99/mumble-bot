/**
 * <b>Async</b> Get get the specified setting from to the given user.
 * @param {DatabaseUser} user - User to fetch the setting from.
 * @param {string} setting - Settings key to fetch the value from.
 * @return {string} - The value in its unchanged string representation as taken from the database.
 */
export async function getSetting(user, setting, connection) {
    const rows = await connection.query("SELECT value FROM UserSettings WHERE user = ? AND setting = ?",
        [user.id, setting]
    );
    if (rows && rows.length > 0) {
        return rows[0].value;
    }
    else {
        return null;
    }
};

/**
 * <b>Async</b> Get all settings of a specified user as an object.
 * @param {DatabaseUser} user - The user to get the settings from.
 * @return {object} - An object with each settings key as key and the corresponding value
 *                    (parsed from json) as value.
 */
export async function getSettings(user, connection) {
    const rows = await connection.query("SELECT setting, value FROM UserSettings WHERE user = ?", [user.id]);
    return rows.reduce((result, row) => {
        return {
            ...result,
            [row.setting]: JSON.parse(row.value)
        };
    }, {});
};

/**
 * <b>Async</b> Set a specified setting to the specified value.
 * @param {DatabaseUser} user - User to change the settings of.
 * @param {string} setting - The setting to change.
 * @param {string} value - The value as already serialized string to store in the database.
 * @return {undefined}
 */
export async function setSetting(user, setting, value, connection) {
    await connection.query(
        "INSERT INTO UserSettings(user, setting, value) " +
        "VALUES(?, ?, ?) " +
        "ON DUPLICATE KEY UPDATE value = VALUES(value)", [user.id, setting, value]
    );
};
