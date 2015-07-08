module.exports = function(Database) {
	/**
	 * Will return an array containing all mumble user ids of mumble users which
	 * are linked to users in this bot and their counterparts usernames.
	 * @param callback - Called when the query is done.
	 */
	Database.prototype.getLinkedMumbleUsers = function(callback) {
		this.pool.query("SELECT m.mumbleId AS id, u.username AS username FROM MumbleUsers m LEFT JOIN Users u ON u.id = m.user",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};

	/**
	 * Returns all mumble user ids of mumble users which are linked to the
	 * specified user.
	 * @param {string} username - Name of the user of which the ids should be
	 *							  fetched.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.getLinkedMumbleUsersOfUser = function(username, callback) {
		this.pool.query("SELECT m.mumbleId AS id FROM MumbleUsers m LEFT JOIN Users u ON u.id = m.user WHERE u.username = ?",
			[username], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};

	/**
	 * Links a mumble user to a user in this bot.
	 * @param {number} id - Id of the mumble user to link.
	 * @param {string} username - User to which the mumble user should be
	 *							  linked.
	 * @param callback - Called when the query has been finished.
	 */
	Database.prototype.linkMumbleUser = function(id, username, callback) {
		this.pool.query("INSERT INTO MumbleUsers(mumbleId, user) VALUES(?, (SELECT id FROM Users WHERE username = ?))",
			[id, username], function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null);
				}
			}.bind(this)
		);
	};

	/**
	 * Returns the full user to which a mumble user id is linked.
	 * @param {number} id - Id of the mumble user to check.
	 * @param callback - Called once the query is done.
	 */
	Database.prototype.getLinkedUser = function(id, callback) {
		this.pool.query("SELECT user FROM MumbleUsers WHERE mumbleId = ?", [id], function(err, rows) {
			if(this._checkError(err, callback)) {
				console.log("The received user is", rows[0].user);
				if(rows.length > 0) {
					this.getUserById(rows[0].user, callback);
				}
				else {
					callback(null, null);
				}
			}
		}.bind(this));
	};
};
