module.exports = function(Database) {
	/**
	 * Register a new user in the database.
	 * @param user - User which should be inserted into the database.
	 * @param {string} user.email - E-Mail address of the new user.
	 * @param {string} user.username - The new users username.
	 * @param {string} user.password - The previously hashed password.
	 * @param {number} user.identifier - Id for the identifier.
	 * @param {string} user.steamid - Steam64 id of the user.
	 * @param {string} user.minecraft - The users nickname in minecraft.
	 */
	Database.prototype.registerUser = function(user, callback) {
		this.pool.query("INSERT INTO Users(email, username, password, identifier, steamid, minecraft) VALUES(?, ?, ?, ?, ?, ?)",
			[user.email, user.username, user.password, user.identifier, user.steamid, user.minecraft], function(err, result) {
				if(this._checkError(err, callback)) {
					callback(null, result.insertId);
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieves details about a user by his identifier.
	 * @param {string} identifier - The identifier of the user to retrieve.
	 * @param callback - Called when the details are retrieved.
	 */
	Database.prototype.getUserByIdentifier = function(identifier, callback) {
		this.pool.query("SELECT u.id AS id FROM Users u Left JOIN Identifiers i ON u.identifier = i.id WHERE i.identifier = ?",
		 	[identifier], function(err, rows) {
				if(this._checkError(err, callback)) {
					if(rows.length > 0) {
						this.getUserById(rows[0].id, callback);
					}
					else {
						callback(null, null);
					}
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieves details about a user by his username.
	 * @param {string} username - The username of the user to retrieve.
	 * @param callback - Called when the details are retrieved.
	 */
	Database.prototype.getUserByUsername = function(username, callback) {
		this.pool.query("SELECT id FROM Users WHERE username = ?", [username], function(err,rows) {
			if(this._checkError(err, callback)) {
				if(rows.length > 0) {
					this.getUserById(rows[0].id, callback);
				}
				else {
					callback(null, null);
				}
			}
		}.bind(this));
	};

	/**
	 * Retrieves details about a user by his id.
	 * @param {number} id - The id of the user to retrieve.
	 * @param callback - Called when the details are retrieved.
	 */
	Database.prototype.getUserById = function(id, callback) {
		this.pool.query("SELECT u.minecraft AS minecraft, u.id AS id, u.username as username, i.identifier AS identifier, u.steamid AS steamid FROM Users u LEFT JOIN Identifiers i ON u.identifier = i.id WHERE u.id = ?",
			[id], function(err, rows) {
				if(this._checkError(err, callback)) {
					var user = rows[0];
					this.getSettings(user, function(err, settings) {
						if(this._checkError(err, callback)) {
							user.settings = settings;
							callback(null, user);
						}
					}.bind(this));
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieves details about a user by his steam Id.
	 * @param {string} steamId - The steamid of the user to retrieve.
	 * @param callback - Called when the details are retrieved.
	 */
	Database.prototype.getUserBySteamId = function(steamId, callback) {
		this.pool.query("SELECT id FROM Users WHERE steamid = ?", [steamId], function(err,rows) {
			if(this._checkError(err, callback)) {
				if(rows.length > 0) {
					this.getUserById(rows[0].id, callback);
				}
				else {
					callback(null, null);
				}
			}
		}.bind(this));
	};

	/**
	 * Retrieves details about a random user.
	 * @param callback - Called when the details are retrieved.
	 */
	Database.prototype.getRandomUser = function(callback) {
		this.pool.query("SELECT id FROM Users ORDER BY RAND() LIMIT 1", function(err,rows) {
			if(this._checkError(err, callback)) {
				if(rows.length > 0) {
					this.getUserById(rows[0].id, callback);
				}
				else {
					callback(null, null);
				}
			}
		}.bind(this));
	};

	/**
	 * Retrieves details about a user by his steam Id.
	 * @param {string} minecraft - The minecraft username of the user to retrieve.
	 * @param callback - Called when the details are retrieved.
	 */
	Database.prototype.getUserByMinecraftUsername = function(minecraft, callback) {
		this.pool.query("SELECT id FROM Users WHERE minecraft = ?", [minecraft], function(err,rows) {
			if(this._checkError(err, callback)) {
				if(rows.length > 0) {
					this.getUserById(rows[0].id, callback);
				}
				else {
					callback(null, null);
				}
			}
		}.bind(this));
	};

	/**
	 * Check the login data of a user.
	 * @param {string} username - Username of the user to check.
	 * @param {string} passwordHash - Already hashed password to compare.
	 * @param callback - Called after the check was done.
	 */
	Database.prototype.checkLoginData = function(username, passwordHash, callback) {
		this.pool.query("SELECT id FROM Users WHERE username = ? AND password = ?", [username, passwordHash],
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows.length > 0);
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieve a list of free identifiers from the database. List will only
	 * contain identifiers which were not yet used by anyone.
	 * @param callback - Called after the list was read from the database.
	 */
	Database.prototype.getFreeIdentifiers = function(callback) {
		this.pool.query("SELECT id, identifier FROM Identifiers WHERE id NOT IN (SELECT identifier FROM Users) ORDER BY Identifiers.id",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieve a list of all identifiers from the database.
	 * @param callback - Called after the list was read from the database.
	 */
	Database.prototype.getAllIdentifiers = function(callback) {
		this.pool.query("SELECT id, identifier FROM Identifiers",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};

	/**
	 * Retrieves a list of users from the database.
	 * @param callback - Called after the query was done.
	 */
	Database.prototype.listUsers = function(callback) {
		this.pool.query("SELECT u.minecraft AS minecraft, u.id AS id, u.username as username, i.identifier AS identifier, u.steamid AS steamid FROM Users u LEFT JOIN Identifiers i ON u.identifier = i.id ORDER BY u.username DESC",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows);
				}
			}.bind(this)
		);
	};

	/**
	 * Counts all user in the database.
	 * @param callback - Called after the query was done.
	 */
	Database.prototype.countUsers = function(callback) {
		this.pool.query("SELECT COUNT(id) AS count FROM Users",
			function(err, rows) {
				if(this._checkError(err, callback)) {
					callback(null, rows[0].count);
				}
			}.bind(this)
		);
	};
};
