class Database {
	/**
	 * Will return an array containing all mumble user ids of mumble users which
	 * are linked to users in this bot and their counterparts usernames.
	 * @param callback - Called when the query is done.
	 */
	getLinkedMumbleUsers(callback) {
		this.pool.query("SELECT m.mumbleId AS id, u.username AS username"
			+ " FROM MumbleUsers m LEFT JOIN Users u ON u.id = m.user",
				(err, rows) => {
					if(this._checkError(err, callback)) {
						callback(null, rows);
					}
				}
		)
	}

	/**
	 * Returns all mumble user ids of mumble users which are linked to the
	 * specified user.
	 * @param {string} username - Name of the user of which the ids should be
	 *							  fetched.
	 * @param callback - Called once the query is done.
	 */
	getLinkedMumbleUsersOfUser(username, callback) {
		this.pool.query(
			"SELECT m.mumbleId AS id FROM MumbleUsers m LEFT JOIN Users u ON u.id = m.user WHERE u.username = ?",
			[username],
			(err, rows) => {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}
		)
	}

	/**
	 * Links a mumble user to a user in this bot.
	 * @param {number} id - Id of the mumble user to link.
	 * @param {string} username - User to which the mumble user should be
	 *							  linked.
	 * @param callback - Called when the query has been finished.
	 */
	linkMumbleUser(id, username, callback) {
		this.pool.query(
			"INSERT INTO MumbleUsers(mumbleId, user) VALUES(?, (SELECT id FROM Users WHERE username = ?))",
			[id, username],
			(err, rows) => {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}
		)
	}

	/**
	 * Returns the full user to which a mumble user id is linked.
	 * @param {number} id - Id of the mumble user to check.
	 * @param callback - Called once the query is done.
	 */
	getLinkedUser(id, callback) {
		this.pool.query("SELECT user FROM MumbleUsers WHERE mumbleId = ?", [id], (err, rows) => {
			if(this._checkError(err, callback)) {
				if(rows.length > 0) {
					this.getUserById(rows[0].user, callback);
				}
				else {
					callback(null, null);
				}
			}
		});
	}
}

module.exports = Database;
