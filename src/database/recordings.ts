import { getUserById } from "./";
import {
    Recording,
    PlaybackCountByUserStat,
    PlaybackCountByDateStat,
    RecordingCountByUserStat,
    RecordingCountByDateStat,
    Label,
    DatabaseUser
} from "../types";

/**
 * Add a new record to the database.
 * @param quote The quote of the record to be added.
 * @param user The user from whom the record was recorded.
 * @param date The date and time the record was recorded.
 * @param labels A list of labels with which this record was tagged.
 * @param duration The duration of the sample in seconds.
 * @param reporter Who ever added this record.
 * @return The unique id of the new record.
 */
export async function addRecording(
        quote: string,
        user: number,
        date: Date,
        labels: number[],
        duration: number,
        reporter: number,
        connection): Promise<number> {
    const result = await connection.query(
        "INSERT INTO Recordings(quote, user, submitted, changed, duration, reporter) VALUES(?, ?, ?, ?, ?, ?)",
        [quote, user, date, new Date(), duration, reporter]
    );
    labels.forEach((label) => addRecordingToLabel(result.insertId, label, connection));
    return result.insertId;
};

/**
 * Complete a list of records by adding all possible information to it by resolving ids of
 * user and labels etc.
 * @param records Uncompleted list of records which need to be recorded.
 * @return List of completed records.
 */
async function completeRecordings(records: Recording[], connection): Promise<Recording[]> {
    const promises: Promise<Recording>[] = records.map((r) => getRecording(r.id, connection));
    return await Promise.all(promises);
};

/**
 * Get the amount of records by one single user.
 * @return List of users and the amount of records they have.
 */
export async function getRecordingCountByUsers(connection): Promise<RecordingCountByUserStat[]> {
    const rows = await connection.query(
        "SELECT COUNT(r.id) AS amount, u.username AS user " +
        "FROM Users u " +
        "LEFT JOIN Recordings r ON r.user = u.id " +
        "GROUP BY u.id HAVING COUNT(r.id) > 0 ORDER BY amount DESC");
    return rows;
};
/**
 * Get the amount of records mapped to days of the week.
 * @return List of days and the amount of records recorded on that day.
 */
export async function getRecordingCountByDays(connection): Promise<RecordingCountByDateStat[]> {
    const rows = await connection.query(
        "SELECT DATE(submitted) AS submitted, COUNT(id) AS amount " +
        "FROM Recordings " +
        "GROUP BY DATE(submitted) ORDER BY submitted DESC"
    );
    return rows;
};
/**
 * Update a record with a new quote and a new list of labels.
 * @param id The unique id of the record which is to be updated.
 * @param quote The new quote to set.
 * @param labels List of the names of labels which should REPLACE the old labels. (All old labels
 *   will be purged so you will have to list all labels that should be kept again here).
 */
export async function updateRecording(id: number, quote: string, labels: number[], connection): Promise<void> {
    await connection.query("UPDATE Recordings SET quote = ?, changed = ? WHERE id = ?", [quote, new Date(), id]);
    await connection.query("DELETE FROM RecordingLabelRelation WHERE record = ?", [id]);
    await Promise.all(labels.map((label) => addRecordingToLabel(id, label, connection)));
};

/**
 * List all records existing in the database.
 * @param since Optional argument to only list records which have been updated after this date.
 * @return List of all records in the database.
 */
export async function listRecordings(since: Date, connection): Promise<Recording[]> {
    const rows = await connection.query(
        "SELECT id " +
        "FROM Recordings " +
        "WHERE id NOT IN (SELECT parent FROM Recordings WHERE overwrite = TRUE) " +
        (since ? "AND changed >= ? " : "") +
        "ORDER BY used DESC", since);
    const records = await completeRecordings(rows, connection);
    return records;
};

/**
 * List all records in the database belonging to one specified user.
 * @param user User for which the records whould be listed.
 * @return List of all records in the database belonging to the specified user.
 */
export async function listRecordingsForUser(user: DatabaseUser, connection): Promise<Recording[]> {
    const rows = await connection.query("SELECT id FROM Recordings WHERE user = ? ORDER BY used DESC", [user.id]);
    const records = await completeRecordings(rows, connection);
    return records;
};

/**
 * Indicate that a record was played back (Increase usages by one).
 * @param id Unique id of the record to update.
 * @return
 */
export async function usedRecording(id: number, connection): Promise<void> {
    await connection.query("UPDATE Recordings SET used = used +1, changed = ? WHERE id = ?", [new Date(), id]);
};
/**
 * Get complet information about one record by its id. This includes resolved user and labels.
 * @param id The unique id of the record that is to be fetched.
 * @return The record belonging to the specified unique id.
 */
export async function getRecording(id: number, connection): Promise<Recording> {
    const rows = await connection.query(
        "SELECT id, quote, used, user, submitted, duration, changed, reporter, overwrite, parent " +
        "FROM Recordings " +
        "WHERE id = ?", [id]
    );
    if (rows && rows.length > 0) {
        const record = rows[0];
        const labels = await getLabelsOfRecording(record.id, connection);
        return {
            ...record,
            labels: labels
        };
    }
    else {
        return;
    }
};

/**
 * Get a random record from the database.
 * @return A random record from the database.
 */
export async function getRandomRecording(connection): Promise<Recording> {
    const rows = await connection.query("SELECT id FROM Recordings ORDER BY RAND() LIMIT 1,1");
    if (rows && rows.length > 0) {
        let record = rows[0];
        record = getRecording(record.id, connection);
        return record;
    }
    else {
        return;
    }
};

/**
 * Get all labels belonging to one record.
 * @param recordId The unique id of the record that is to be fetched.
 * @return List of all labels with which the specified record is tagged.
 */
export async function getLabelsOfRecording(recordId: number, connection): Promise<Label[]> {
    const rows = await connection.query(
        "SELECT r.id AS id, r.name AS name " +
        "FROM RecordingLabels r " +
        "LEFT JOIN RecordingLabelRelation l ON l.label = r.id WHERE l.record = ?", [recordId]
    );
    return rows;
};

/**
 * Get the amount of records in the database.
 * @return Amount of all records in the database.
 */
export async function getRecordingCount(connection): Promise<number> {
    const rows = await connection.query("SELECT COUNT(id) AS amount FROM Recordings");
    return rows[0].amount;
};

/**
 * Add a new label to the database.
 * @param name Name of the new label to add.
 * @return Generated unique id of the new label that was added.
 */
export async function addRecordingLabel(name: string, connection): Promise<number> {
    const result = await connection.query("INSERT INTO RecordingLabels(name) VALUES(?)", [name]);
    return result.insertId;
};

/**
 * List all labels exiting in the database.
 * @return A list of all labels in the database with an added numerical property "records"
 *   that represents the number of records tagged with the label.
 */
export async function listLabels(connection): Promise<Label[]> {
    const rows = await connection.query(
        "SELECT name, id, COUNT(record) AS records " +
        "FROM RecordingLabels " +
        "LEFT JOIN RecordingLabelRelation ON id = label " +
        "GROUP BY id"
    );
    return rows;
};

/**
 * Add a label to a record.
 * @param record Unique id of the record to tag with the label.
 * @param label Unique id of the label with which the record should be tagged.
 */
export async function addRecordingToLabel(record: number, label: number, connection): Promise<void> {
    await connection.query("INSERT INTO RecordingLabelRelation(record, label) VALUES(?, ?)", [record, label]);
};

/**
 * List all records belonging to one label.
 * @param label Unique id of the label of which to list the records.
 * @return List of all records which were tagged with the specified label.
 */
export async function listRecordingsByLabel(label: number, connection): Promise<Recording[]> {
    const rows = await connection.query(
        "SELECT id " +
        "FROM Recordings " +
        "LEFT JOIN RecordingLabelRelation ON id = record " +
        "WHERE label = ? " +
        "ORDER BY used DESC", [label]
    );
    const records = await completeRecordings(rows, connection)
    return records;
};

/**
 * Look up 20 records with their quotes matching a given query string.
 * @param part Query string which should be looked up in the database.
 * @return A list of max. 20 records that match the given query string.
 */
export async function lookupRecording(part: string, connection): Promise<Recording[]> {
    const rows = await connection.query(
        "SELECT id, quote, user, used, submitted " +
        "FROM Recordings " +
        "WHERE quote LIKE ? " +
        "ORDER BY used DESC " +
        "LIMIT 20", ["%" + part + "%"]
    );
    const promises: Promise<Recording>[] = rows.map((r) => getRecording(r.id, connection));
    return await Promise.all(promises);
};
/**
 * Return the amount of playbacks each record of each user has received grouped by the users.
 * @return List of all users and how often their records have been played back.
 */
export async function getRecordingPlaybackCountPerUser(connection): Promise<PlaybackCountByUserStat[]> {
    const rows = await connection.query(
        "SELECT username AS user, SUM(used) AS playbacks, SUM(used)/COUNT(r.id) AS playbacksRelative " +
        "FROM Recordings r " +
        "LEFT JOIN Users u ON u.id = user " +
        "GROUP BY user"
    );
    return rows;
};

/**
 * Forks a record after it was edited.
 * @param user User who spoke the record.
 * @param submitted The date the record was submitted.
 * @param quote New quote of the record.
 * @param parent Parent record this record was forked from (id).
 * @param overwrite hether the original record should be shadowed by this one.
 * @param reporter The user that forked this record.
 * @param duration New duration of this record.
 * @return id of the new record.
 */
export async function forkRecording(
        user: number,
        submitted: Date,
        quote: string,
        parent: number,
        overwrite: boolean,
        reporter: number,
        duration: number,
        connection): Promise<number> {
    const result = await connection.query(
        "INSERT INTO Recordings(user, submitted, reporter, duration, quote, changed, overwrite, parent) " +
        "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
        [user.id, submitted, reporter.id, duration, quote, new Date(), overwrite, parent]);
    return result.insertId;
};
