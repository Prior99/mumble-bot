/**
 * Extends the database with methods for records.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const RecordsExtension = function(Database) {
	/**
	 * <b>Async</b> Add a new record to the database.
	 * @param {string} quote - The quote of the record to be added.
	 * @param {DatabaseUser} user - The user from whom the record was recorded.
	 * @param {date} date - The date and time the record was recorded.
	 * @param {string[]} labels - A list of labels with which this record was tagged.
	 * @param {number} duration - The duration of the sample in seconds.
	 * @param {DatabaseUser} reporter - Who ever added this record.
	 * @return {number} - The unique id of the new record.
	 */
	Database.prototype.addRecord = async function(quote, user, date, labels, duration, reporter) {
		const result = await this.connection.query(
			"INSERT INTO Records(quote, user, submitted, changed, duration, reporter) VALUES(?, ?, ?, ?, ?, ?)",
			[quote, user.id, date, new Date(), duration, reporter.id]
		);
		labels.forEach((label) => this.addRecordToLabel(result.insertId, label));
		return result.insertId;
	};

	/**
	 * <b>Async</b> Complete a list of records by adding all possible information to it by resolving ids of
	 * user and labels etc.
	 * @param {Record[]} records - Uncompleted list of records which need to be recorded.
	 * @return {Record[]} - List of completed records.
	 */
	Database.prototype._completeRecords = async function(records) {
		const rs = await Promise.all(records.map((r) => this.getRecord(r.id)));
		return rs;
	};

		/**
		 * @typedef RecordCountByUserStat
		 * @property {number} amount - Amount of records this user has.
		 * @property {string} user - Name of the user the records belong to.
		 */
	/**
	 * <b>Async</b> Get the amount of records by one single user.
	 * @return {RecordCountByUserStat[]} - List of users and the amount of records they have.
	 */
	Database.prototype.getRecordCountByUsers = async function() {
		const rows = await this.connection.query(
			"SELECT COUNT(r.id) AS amount, u.username AS user " +
			"FROM Users u " +
			"LEFT JOIN Records r ON r.user = u.id " +
			"GROUP BY u.id HAVING COUNT(r.id) > 0 ORDER BY amount DESC");
		return rows;
	};

	/**
	 * @typedef RecordCountByDateStat
	 * @property {number} amount - Amount of records this user has.
	 * @property {date} date - Date of the day this entry belongs to.
	 */
	/**
	 * <b>Async</b> Get the amount of records mapped to days of the week.
	 * @return {RecordCountByDateStat[]} - List of days and the amount of records recorded on that day.
	 */
	Database.prototype.getRecordCountByDays = async function() {
		const rows = await this.connection.query(
			"SELECT DATE(submitted) AS submitted, COUNT(id) AS amount " +
			"FROM Records " +
			"GROUP BY DATE(submitted) ORDER BY submitted DESC"
		);
		return rows;
	};
	/**
	 * <b>Async</b> Update a record with a new quote and a new list of labels.
	 * @param {number} id - The unique id of the record which is to be updated.
	 * @param {string} quote - The new quote to set.
	 * @param {string[]} labels - List of the names of labels which should REPLACE the old labels. (All old labels
	 *                            will be purged so you will have to list all labels that should be kept again here).
	 * @return {undefined}
	 */
	Database.prototype.updateRecord = async function(id, quote, labels) {
		await this.connection.query("UPDATE Records SET quote = ?, changed = ? WHERE id = ?", [quote, new Date(), id]);
		await this.connection.query("DELETE FROM RecordLabelRelation WHERE record = ?", [id]);
		await Promise.all(labels.map((label) => this.addRecordToLabel(id, label)));
	};

	/**
	 * <b>Async</b> List all records existing in the database.
	 * @param {date} [since] - Optional argument to only list records which have been updated after this date.
	 * @return {Record[]} - List of all records in the database.
	 */
	Database.prototype.listRecords = async function(since) {
		let rows;
		if(since) {
			rows = await this.connection.query("SELECT id FROM Records WHERE changed >= ? ORDER BY used DESC", since);
		}
		else {
			rows = await this.connection.query("SELECT id FROM Records ORDER BY used DESC");
		}
		const records = await this._completeRecords(rows);
		return records;
	};

	/**
	 * <b>Async</b> List all records in the database belonging to one specified user.
	 * @param {DatabaseUser} user - User for which the records whould be listed.
	 * @return {Record[]} - List of all records in the database belonging to the specified user.
	 */
	Database.prototype.listRecordsForUser = async function(user) {
		const rows = await this.connection.query("SELECT id FROM Records WHERE user = ? ORDER BY used DESC", [user.id]);
		const records = await this._completeRecords(rows);
		return records;
	};

	/**
	 * <b>Async</b> Indicate that a record was played back (Increase usages by one).
	 * @param {number} id - Unique id of the record to update.
	 * @return {undefined}
	 */
	Database.prototype.usedRecord = async function(id) {
		await this.connection.query("UPDATE Records SET used = used +1 WHERE id = ?", [id]);
	};
	/**
	 * A label with which the records can be tagged.
	 * @typedef Label
	 * @property {number} id - Unique id of this label.
	 * @property {string} name - Name of this label.
	 */
	/**
	 * A single record as represented in the database.
	 * @typedef Record
	 * @property {number} id - Unique id of this record which is used as the mapping to the audio file.
	 * @property {string} quote - The quote for this record (textual description).
	 * @property {number} used - How often this record was already used.
	 * @property {DatabaseUser} user - The user who said this record.
	 * @property {date} submitted - When the record was originally recorded.
	 * @property {Label[]} labels - A list of all labels with which this record was tagged.
	 */

	/**
	 * <b>Async</b> Get complet information about one record by its id. This includes resolved user and labels.
	 * @param {number} id - The unique id of the record that is to be fetched.
	 * @return {Record} - The record belonging to the specified unique id.
	 */
	Database.prototype.getRecord = async function(id) {
		const rows = await this.connection.query(
			"SELECT id, quote, used, user, submitted, duration, changed, reporter " +
			"FROM Records " +
			"WHERE id = ?", [id]
		);
		if(rows && rows.length > 0) {
			const record = rows[0];
			const user = await this.getUserById(record.user);
			const labels = await this.getLabelsOfRecord(record.id);
			const reporter = await this.getUserById(record.reporter);
			record.reporter = reporter;
			record.user = user;
			record.labels = labels;
			return record;
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Get a random record from the database.
	 * @return {Record} - A random record from the database.
	 */
	Database.prototype.getRandomRecord = async function() {
		const rows = await this.connection.query("SELECT id FROM Records ORDER BY RAND() LIMIT 1,1");
		if(rows && rows.length > 0) {
			let record = rows[0];
			record = this.getRecord(record.id);
			return record;
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Get all labels belonging to one record.
	 * @param {number} recordId - The unique id of the record that is to be fetched.
	 * @return {Label[]} - List of all labels with which the specified record is tagged.
	 */
	Database.prototype.getLabelsOfRecord = async function(recordId) {
		const rows = await this.connection.query(
			"SELECT r.id AS id, r.name AS name " +
			"FROM RecordLabels r " +
			"LEFT JOIN RecordLabelRelation l ON l.label = r.id WHERE l.record = ?", [recordId]
		);
		return rows;
	};

	/**
	 * <b>Async</b> Get the amount of records in the database.
	 * @return {number} - Amount of all records in the database.
	 */
	Database.prototype.getRecordCount = async function() {
		const rows = await this.connection.query("SELECT COUNT(id) AS amount FROM Records");
		return rows[0].amount;
	};

	/**
	 * <b>Async</b> Add a new label to the database.
	 * @param {string} name - Name of the new label to add.
	 * @return {number} - Generated unique id of the new label that was added.
	 */
	Database.prototype.addRecordLabel = async function(name) {
		const result = await this.connection.query("INSERT INTO RecordLabels(name) VALUES(?)", [name]);
		return result.insertId;
	};

	/**
	 * <b>Async</b> List all labels exiting in the database.
	 * @return {Label[]} - A list of all labels in the database with an added numerical property "records"
	 *                     that represents the number of records tagged with the label.
	 */
	Database.prototype.listLabels = async function() {
		const rows = await this.connection.query(
			"SELECT name, id, COUNT(record) AS records " +
			"FROM RecordLabels " +
			"LEFT JOIN RecordLabelRelation ON id = label " +
			"GROUP BY id"
		);
		return rows;
	};

	/**
	 * <b>Async</b> Add a label to a record.
	 * @param {number} record - Unique id of the record to tag with the label.
	 * @param {number} label - Unique id of the label with which the record should be tagged.
	 * @return {undefined}
	 */
	Database.prototype.addRecordToLabel = async function(record, label) {
		await this.connection.query("INSERT INTO RecordLabelRelation(record, label) VALUES(?, ?)", [record, label]);
	};

	/**
	 * <b>Async</b> List all records belonging to one label.
	 * @param {number} label - Unique id of the label of which to list the records.
	 * @return {Record[]} - List of all records which were tagged with the specified label.
	 */
	Database.prototype.listRecordsByLabel = async function(label) {
		const rows = await this.connection.query(
			"SELECT id " +
			"FROM Records " +
			"LEFT JOIN RecordLabelRelation ON id = record " +
			"WHERE label = ? " +
			"ORDER BY used DESC", [label]
		);
		const records = await this._completeRecords(rows)
		return records;
	};

	/**
	 * <b>Async</b> Look up 20 records with their quotes matching a given query string.
	 * @param {string} part - Query string which should be looked up in the database.
	 * @return {Record[]} - A list of max. 20 records that match the given query string.
	 */
	Database.prototype.lookupRecord = async function(part) {
		const rows = await this.connection.query(
			"SELECT id, quote, user, used, submitted " +
			"FROM Records " +
			"WHERE quote LIKE ? " +
			"ORDER BY used DESC " +
			"LIMIT 20", ["%" + part + "%"]
		);
		const records = await Promise.all(rows.map((r) => this.getRecord(r.id)));
		return records;
	};
	/**
	 * @typedef PlaybackCountByUserStat
	 * @property {number} playbacks - How often all records of the user have been played back in total.
	 * @property {string} user - Name of the user to which the playbacks belong.
	 * @property {number} playbacksRelative - playbacks relative to total amount of records in the database.
	 */
	/**
	 * <b>Async</b> Return the amount of playbacks each record of each user has received grouped by the users.
	 * @return {PlaybackCountByUserStat[]} - List of all users and how often their records have been played back.
	 */
	Database.prototype.getRecordPlaybackCountPerUser = async function() {
		const rows = await this.connection.query(
			"SELECT username AS user, SUM(used) AS playbacks, SUM(used)/COUNT(r.id) AS playbacksRelative " +
			"FROM Records r " +
			"LEFT JOIN Users u ON u.id = user " +
			"GROUP BY user"
		);
		return rows;
	};
};

export default RecordsExtension;
