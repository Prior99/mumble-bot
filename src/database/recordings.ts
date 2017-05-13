import { getUserById } from "./";

/**
 * Add a new record to the database.
 * @param {string} quote - The quote of the record to be added.
 * @param {DatabaseUser} user - The user from whom the record was recorded.
 * @param {date} date - The date and time the record was recorded.
 * @param {string[]} labels - A list of labels with which this record was tagged.
 * @param {number} duration - The duration of the sample in seconds.
 * @param {DatabaseUser} reporter - Who ever added this record.
 * @return {number} - The unique id of the new record.
 */
export async function addRecording(quote, user, date, labels, duration, reporter, connection) {
    const result = await connection.query(
        "INSERT INTO Recordings(quote, user, submitted, changed, duration, reporter) VALUES(?, ?, ?, ?, ?, ?)",
        [quote, user.id, date, new Date(), duration, reporter.id]
    );
    labels.forEach((label) => addRecordingToLabel(result.insertId, label, connection));
    return result.insertId;
};

/**
 * Complete a list of records by adding all possible information to it by resolving ids of
 * user and labels etc.
 * @param {Recording[]} records - Uncompleted list of records which need to be recorded.
 * @return {Recording[]} - List of completed records.
 */
async function completeRecordings(records, connection) {
    const rs = await Promise.all(records.map((r) => getRecording(r.id, connection)));
    return rs;
};

/**
 * @typedef RecordingCountByUserStat
 * @property {number} amount - Amount of records this user has.
 * @property {string} user - Name of the user the records belong to.
 */
/**
 * Get the amount of records by one single user.
 * @return {RecordingCountByUserStat[]} - List of users and the amount of records they have.
 */
export async function getRecordingCountByUsers(connection) {
    const rows = await connection.query(
        "SELECT COUNT(r.id) AS amount, u.username AS user " +
        "FROM Users u " +
        "LEFT JOIN Recordings r ON r.user = u.id " +
        "GROUP BY u.id HAVING COUNT(r.id) > 0 ORDER BY amount DESC");
    return rows;
};

/**
 * @typedef RecordingCountByDateStat
 * @property {number} amount - Amount of records this user has.
 * @property {date} date - Date of the day this entry belongs to.
 */
/**
 * Get the amount of records mapped to days of the week.
 * @return {RecordingCountByDateStat[]} - List of days and the amount of records recorded on that day.
 */
export async function getRecordingCountByDays(connection) {
    const rows = await connection.query(
        "SELECT DATE(submitted) AS submitted, COUNT(id) AS amount " +
        "FROM Recordings " +
        "GROUP BY DATE(submitted) ORDER BY submitted DESC"
    );
    return rows;
};
/**
 * Update a record with a new quote and a new list of labels.
 * @param {number} id - The unique id of the record which is to be updated.
 * @param {string} quote - The new quote to set.
 * @param {string[]} labels - List of the names of labels which should REPLACE the old labels. (All old labels
 *                            will be purged so you will have to list all labels that should be kept again here).
 * @return {undefined}
 */
export async function updateRecording(id, quote, labels, connection) {
    await connection.query("UPDATE Recordings SET quote = ?, changed = ? WHERE id = ?", [quote, new Date(), id]);
    await connection.query("DELETE FROM RecordingLabelRelation WHERE record = ?", [id]);
    await Promise.all(labels.map((label) => addRecordingToLabel(id, label, connection)));
};

/**
 * List all records existing in the database.
 * @param {date} [since] - Optional argument to only list records which have been updated after this date.
 * @return {Recording[]} - List of all records in the database.
 */
export async function listRecordings(since, connection) {
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
 * @param {DatabaseUser} user - User for which the records whould be listed.
 * @return {Recording[]} - List of all records in the database belonging to the specified user.
 */
export async function listRecordingsForUser(user, connection) {
    const rows = await connection.query("SELECT id FROM Recordings WHERE user = ? ORDER BY used DESC", [user.id]);
    const records = await completeRecordings(rows, connection);
    return records;
};

/**
 * Indicate that a record was played back (Increase usages by one).
 * @param {number} id - Unique id of the record to update.
 * @return {undefined}
 */
export async function usedRecording(id, connection) {
    await connection.query("UPDATE Recordings SET used = used +1, changed = ? WHERE id = ?", [new Date(), id]);
};
/**
 * Get complet information about one record by its id. This includes resolved user and labels.
 * @param {number} id - The unique id of the record that is to be fetched.
 * @return {Recording} - The record belonging to the specified unique id.
 */
export async function getRecording(id, connection) {
    const rows = await connection.query(
        "SELECT id, quote, used, user, submitted, duration, changed, reporter, overwrite, parent " +
        "FROM Recordings " +
        "WHERE id = ?", [id]
    );
    if (rows && rows.length > 0) {
        const record = rows[0];
        const user = await getUserById(record.user, connection);
        const labels = await getLabelsOfRecording(record.id, connection);
        const reporter = await getUserById(record.reporter, connection);
        record.reporter = reporter;
        record.user = user;
        record.labels = labels;
        return record;
    }
    else {
        return;
    }
};

/**
 * Get a random record from the database.
 * @return {Recording} - A random record from the database.
 */
export async function getRandomRecording(connection) {
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
 * @param {number} recordId - The unique id of the record that is to be fetched.
 * @return {Label[]} - List of all labels with which the specified record is tagged.
 */
export async function getLabelsOfRecording(recordId, connection) {
    const rows = await connection.query(
        "SELECT r.id AS id, r.name AS name " +
        "FROM RecordingLabels r " +
        "LEFT JOIN RecordingLabelRelation l ON l.label = r.id WHERE l.record = ?", [recordId]
    );
    return rows;
};

/**
 * Get the amount of records in the database.
 * @return {number} - Amount of all records in the database.
 */
export async function getRecordingCount(connection) {
    const rows = await connection.query("SELECT COUNT(id) AS amount FROM Recordings");
    return rows[0].amount;
};

/**
 * Add a new label to the database.
 * @param {string} name - Name of the new label to add.
 * @return {number} - Generated unique id of the new label that was added.
 */
export async function addRecordingLabel(name, connection) {
    const result = await connection.query("INSERT INTO RecordingLabels(name) VALUES(?)", [name]);
    return result.insertId;
};

/**
 * List all labels exiting in the database.
 * @return {Label[]} - A list of all labels in the database with an added numerical property "records"
 *                     that represents the number of records tagged with the label.
 */
export async function listLabels(connection) {
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
 * @param {number} record - Unique id of the record to tag with the label.
 * @param {number} label - Unique id of the label with which the record should be tagged.
 * @return {undefined}
 */
export async function addRecordingToLabel(record, label, connection) {
    await connection.query("INSERT INTO RecordingLabelRelation(record, label) VALUES(?, ?)", [record, label]);
};

/**
 * List all records belonging to one label.
 * @param {number} label - Unique id of the label of which to list the records.
 * @return {Recording[]} - List of all records which were tagged with the specified label.
 */
export async function listRecordingsByLabel(label, connection) {
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
 * @param {string} part - Query string which should be looked up in the database.
 * @return {Recording[]} - A list of max. 20 records that match the given query string.
 */
export async function lookupRecording(part, connection) {
    const rows = await connection.query(
        "SELECT id, quote, user, used, submitted " +
        "FROM Recordings " +
        "WHERE quote LIKE ? " +
        "ORDER BY used DESC " +
        "LIMIT 20", ["%" + part + "%"]
    );
    const records = await Promise.all(rows.map((r) => getRecording(r.id, connection)));
    return records;
};
/**
 * @typedef PlaybackCountByUserStat
 * @property {number} playbacks - How often all records of the user have been played back in total.
 * @property {string} user - Name of the user to which the playbacks belong.
 * @property {number} playbacksRelative - playbacks relative to total amount of records in the database.
 */
/**
 * Return the amount of playbacks each record of each user has received grouped by the users.
 * @return {PlaybackCountByUserStat[]} - List of all users and how often their records have been played back.
 */
export async function getRecordingPlaybackCountPerUser(connection) {
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
 * @param {DatabaseUser} user - User who spoke the record.
 * @param {Date} submitted - The date the record was submitted.
 * @param {string} quote - New quote of the record.
 * @param {number} parent - Parent record this record was forked from (id).
 * @param {boolean} overwrite -Whether the original record should be shadowed by this one.
 * @param {DatabaseUser} reporter - The user that forked this record.
 * @param {number} duration - New duration of this record.
 * @return {number} id of the new record.
 */
export async function forkRecording(user, submitted, quote, parent, overwrite, reporter, duration, connection) {
    const result = await connection.query(
        "INSERT INTO Recordings(user, submitted, reporter, duration, quote, changed, overwrite, parent) " +
        "VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
        [user.id, submitted, reporter.id, duration, quote, new Date(), overwrite, parent]);
    return result.insertId;
};
