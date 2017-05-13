import * as Winston from "winston";
const millisecondsPerSecond = 1000;
/**
 * Write a new set of statistics into the database when a user has spoken.
 * @param {DatabaseUser} user - User that has spoken.
 * @param {date} started - When the speech has started.
 * @param {date} ended - When the speech has ended.
 * @return {undefined}
 */
export async function writeUserStatsSpeak(user, started, ended, connection) {
    await connection.query(
        "INSERT INTO UserStatsSpeaking(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended]
    );
};

/**
 * Write a new set of statistics into the database when a user is online.
 * @param {DatabaseUser} user - User that has spoken.
 * @param {date} started - When the user got online.
 * @param {date} ended - When the user got offline.
 * @return {undefined}
 */
export async function writeUserStatsOnline(user, started, ended, connection) {
    await connection.query(
        "INSERT INTO UserStatsOnline(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended]
    );
};

/**
 * @typedef StatObjectSpeechPerHour
 * @property {number} hour - The hour this object is representing.
 * @property {number} amount - Amount of speech in this hour.
 */
/**
 * Get statistics about how much speech per hour was produced.
 * @return {StatObjectSpeechPerHour[]} - List of objects representing the statistics requested.
 */
export async function getSpokenPerHour(connection) {
    const rows = await connection.query(
        "SELECT HOUR(started) AS hour, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsSpeaking GROUP BY HOUR(started)"
    );
    return rows.map((elem) => ({
        hour: elem.hour,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
};

/**
 * @typedef StatObjectSpeechPerUser
 * @property {string} user - Name of the user this object is representing.
 * @property {number} amount - Amount of speech in this hour.
 */
/**
 * Get statistics about the speech per user.
 * @return {StatObjectSpeechPerUser[]} - List of objects representing the statistics requested.
 */
export async function getSpokenPerUser(connection) {
    const rows = await connection.query(
        "SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsSpeaking " +
        "LEFT JOIN Users u ON user = u.id " +
        "GROUP BY user");
    return rows.map(elem => ({
        user: elem.user,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
};

/**
 * @typedef StatObjectSpeechPerWeekday
 * @property {string} user - Name of the user this object is representing.
 * @property {number} amount - Amount of speech in this hour.
 */
/**
 * Get statistics about speech per weekday.
 * @return {StatObjectSpeechPerWeekday[]} - List of objects representing the statistics requested.
 */
export async function getSpokenPerWeekday(connection) {
    const rows = await connection.query(
        "SELECT DAYOFWEEK(started) AS day, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsSpeaking " +
        "GROUP BY DAYOFWEEK(started)"
    );
    return rows.map(elem => ({
        day: elem.day,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
};
/**
 * @typedef StatObjectOnlinePerUser
 * @property {string} user - Name of the user this object is representing.
 * @property {number} amount - Amount of time the user was online in seconds.
 */
/**
 * Get statistics about the online time per user.
 * @return {StatObjectOnlinePerUser[]} - List of objects representing the statistics requested.
 */
export async function getOnlinePerUser(connection) {
    const rows = await connection.query(
        "SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsOnline " +
        "LEFT JOIN Users u ON user = u.id " +
        "GROUP BY user"
    );
    return rows.map(elem => ({
        user: elem.user,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
};
