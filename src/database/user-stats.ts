import * as Winston from "winston";
import { StatObjectSpeechPerHour, StatObjectSpeechPerUser, StatObjectSpeechPerWeekday, StatObjectOnlinePerUser } from "../types";
import { DatabaseUser } from "../models";

const millisecondsPerSecond = 1000;

/**
 * Write a new set of statistics into the database when a user has spoken.
 * @param user User that has spoken.
 * @param started When the speech has started.
 * @param ended When the speech has ended.
 */
export async function writeUserStatsSpeak(user: DatabaseUser, started: Date, ended: Date, connection): Promise<void> {
    await connection.query(
        "INSERT INTO UserStatsSpeaking(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended]
    );
}

/**
 * Write a new set of statistics into the database when a user is online.
 * @param user User that has spoken.
 * @param started When the user got online.
 * @param ended When the user got offline.
 */
export async function writeUserStatsOnline(user: DatabaseUser, started: Date, ended: Date, connection): Promise<void> {
    await connection.query(
        "INSERT INTO UserStatsOnline(user, started, ended) VALUES(?, ?, ?)", [user.id, started, ended]
    );
}

/**
 * Get statistics about how much speech per hour was produced.
 * @return List of objects representing the statistics requested.
 */
export async function getSpokenPerHour(connection): Promise<StatObjectSpeechPerHour[]> {
    const rows = await connection.query(
        "SELECT HOUR(started) AS hour, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsSpeaking GROUP BY HOUR(started)"
    );
    return rows.map((elem) => ({
        hour: elem.hour,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
}

/**
 * Get statistics about the speech per user.
 * @return List of objects representing the statistics requested.
 */
export async function getSpokenPerUser(connection): Promise<StatObjectSpeechPerUser[]> {
    const rows = await connection.query(
        "SELECT username AS user, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsSpeaking " +
        "LEFT JOIN Users u ON user = u.id " +
        "GROUP BY user");
    return rows.map(elem => ({
        user: elem.user,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
}

/**
 * Get statistics about speech per weekday.
 * @return List of objects representing the statistics requested.
 */
export async function getSpokenPerWeekday(connection): Promise<StatObjectSpeechPerWeekday[]> {
    const rows = await connection.query(
        "SELECT DAYOFWEEK(started) AS day, SUM(TIME_TO_SEC(ended-started)) AS amount " +
        "FROM UserStatsSpeaking " +
        "GROUP BY DAYOFWEEK(started)"
    );
    return rows.map(elem => ({
        day: elem.day,
        amount: new Date(elem.amount * millisecondsPerSecond)
    }));
}

/**
 * Get statistics about the online time per user.
 * @return List of objects representing the statistics requested.
 */
export async function getOnlinePerUser(connection): Promise<StatObjectOnlinePerUser[]> {
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
}
