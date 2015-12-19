/**
 * Extends the database with methods for managing users.
 * @param {Database} Database - The Database class to extend.
 * @return {undefined}
 */
const UsersExtension = function(Database) {
	/**
	 * <b>Async</b> Register a new user in the database.
	 * @param {object} user - User which should be inserted into the database.
	 * @param {string} user.email - E-Mail address of the new user.
	 * @param {string} user.username - The new users username.
	 * @param {string} user.password - The previously hashed password.
	 * @param {number} user.identifier - Id for the identifier.
	 * @param {string} user.steamid - Steam64 id of the user.
	 * @param {string} user.minecraft - The users nickname in minecraft.
	 * @return {number} - Unique id of the newly generated user.
	 */
	Database.prototype.registerUser = async function(user) {
		const result = await this.connection.query(
			"INSERT INTO Users(email, username, password, identifier, steamid, minecraft) VALUES(?, ?, ?, ?, ?, ?)",
			[user.email, user.username, user.password, user.identifier, user.steamid, user.minecraft]
		);
		return result.insertId;
	};

	/**
	 * <b>Async</b> Retrieves details about a user by his identifier.
	 * @param {string} identifier - The identifier of the user to retrieve.
	 * @return {DatabaseUser} - The user related to this identifier.
	 */
	Database.prototype.getUserByIdentifier = async function(identifier) {
		const rows = await this.connection.query(
			"SELECT u.id AS id FROM Users u " +
			"Left JOIN Identifiers i ON u.identifier = i.id WHERE i.identifier = ?",
			[identifier]
		);
		if(rows && rows.length > 0) {
			return this.getUserById(rows[0].id);
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Retrieves details about a user by his username.
	 * @param {string} username - The username of the user to retrieve.
	 * @return {DatabaseUser} - The user related to this username.
	 */
	Database.prototype.getUserByUsername = async function(username) {
		const rows = await this.connection.query("SELECT id FROM Users WHERE username = ?", [username]);
		if(rows && rows.length > 0) {
			return this.getUserById(rows[0].id);
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> A user from the database.
	 * @typedef {object} DatabaseUser
	 * @property {string} minecraft - The minecraft username of the user.
	 * @property {string} username - The username of this user.
	 * @property {string} identifier - The identifier of the user.
	 * @property {string} steamid - The Steam64 id of the user.
	 * @property {object} settings - The custom settings of the user are stored key-value-wise in this object.
	 */

	/**
	 * <b>Async</b> Retrieves details about a user by his id.
	 * @param {number} id - The id of the user to retrieve.
	 * @return {DatabaseUser} - The user related to this identifier.
	 */
	Database.prototype.getUserById = async function(id) {
		const rows = await this.connection.query(
			"SELECT " +
				"u.minecraft AS minecraft, " +
				"u.id AS id, " +
				"u.username as username, " +
				"i.identifier AS identifier, " +
				"u.steamid AS steamid "+
			"FROM Users u " +
			"LEFT JOIN Identifiers i ON u.identifier = i.id " +
			"WHERE u.id = ?",
			[id]
		);
		if(rows && rows.length > 0) {
			const user = rows[0];
			const settings = this.getSettings(user);
			user.settings = settings;
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Retrieves details about a user by his steam Id.
	 * @param {string} steamId - The steamid of the user to retrieve.
	 * @return {DatabaseUser} - The user related to this steam id.
	 */
	Database.prototype.getUserBySteamId = async function(steamId) {
		const rows = await this.connection.query("SELECT id FROM Users WHERE steamid = ?", [steamId]);
		if(rows && rows.length > 0) {
			return this.getUserById(rows[0].id);
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Retrieves details about a random user.
	 * @return {DatabaseUser} - A random user from the database.
	 */
	Database.prototype.getRandomUser = async function() {
		const rows = await this.connection.query("SELECT id FROM Users ORDER BY RAND() LIMIT 1");
		if(rows && rows.length > 0) {
			return this.getUserById(rows[0].id);
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Retrieves details about a user by his steam Id.
	 * @param {string} minecraft - The minecraft username of the user to retrieve.
	 * @return {DatabaseUser} - The user related to this minecraft username.
	 */
	Database.prototype.getUserByMinecraftUsername = async function(minecraft) {
		const rows = await this.connection.query("SELECT id FROM Users WHERE minecraft = ?", [minecraft]);
		if(rows && rows.length > 0) {
			return this.getUserById(rows[0].id);
		}
		else {
			return null;
		}
	};

	/**
	 * <b>Async</b> Check the login data of a user.
	 * @param {string} username - Username of the user to check.
	 * @param {string} passwordHash - Already hashed password to compare.
	 * @return {boolean} - Whether the username and the password matched.
	 */
	Database.prototype.checkLoginData = async function(username, passwordHash) {
		const rows = await this.connection.query(
			"SELECT id FROM Users " +
			"WHERE username = ? AND password = ?", [username, passwordHash]);
		return rows && rows.length > 0;
	};
	/**
	 * @typedef DatabaseIdentifier
	 * @property {number} id - The unique id of this identifier.
	 * @property {string} identifier - The identifier.
	 */
	/**
	 * <b>Async</b> Retrieve a list of free identifiers from the database. List will only
	 * contain identifiers which were not yet used by anyone.
	 * @return {DatabaseIdentifier[]} - A list of all free identifiers.
	 */
	Database.prototype.getFreeIdentifiers = async function() {
		const rows = await this.connection.query(
			"SELECT id, identifier FROM Identifiers " +
			"WHERE id NOT IN (SELECT identifier FROM Users) " +
			"ORDER BY Identifiers.id"
		);
		return rows;
	};

	/**
	 * <b>Async</b> Retrieve a list of all identifiers from the database.
	 * @return {DatabaseIdentifier[]} - A list of all identifiers in the database.
	 */
	Database.prototype.getAllIdentifiers = async function() {
		const rows = await this.connection.query("SELECT id, identifier FROM Identifiers");
		return rows;
	};

	/**
	 * <b>Async</b> Retrieves a list of users from the database.
	 * @return {DatabaseUser[]} - All users in the whole database.
	 */
	Database.prototype.listUsers = async function() {
		const rows = await this.connection.query("SELECT id FROM Users");
		const users = await Promise.all(rows.map((u) => this.getUserById(u.id)));
		return users;
	};

	/**
	 * <b>Async</b> Counts all user in the database.
	 * @return {number} - Amount of users in the database.
	 */
	Database.prototype.countUsers = async function() {
		const rows = await this.connection.query("SELECT COUNT(id) AS count FROM Users");
		return rows[0].count;
	};
};

export default UsersExtension;
