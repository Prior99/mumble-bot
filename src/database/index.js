/*
 * Imports
 */
import Winston from "winston";
import * as MySQL from "promise-mysql";
import * as FS from "fs-promise";

import QuotesExtension from "./quotes.js";
import TTSCacheExtension from "./ttscache.js";
import UsersExtension from "./users.js";
import PermissionsExtension from "./permissions.js";
import MumbleUsersExtension from "./mumbleUsers.js";
import BassExtension from "./bass.js";
import AutocompleteExtension from "./autocomplete.js";
import SoundsExtension from "./sounds.js";
import RecordsExtension from "./records.js";
import SettingsExtension from "./settings.js";
import LogExtension from "./log.js";
import RSSExtension from "./rss.js";
import DialogsExtension from "./dialogs.js";
import UserStatsExtension from "./userstats.js";

/*
 * Code
 */

const timeout = 4000;

/**
 * Handles the connection to a MySQL-Database.
 */
class Database {
	/**
	 * @constructor
	 * @param {object} options - Options for connecting to the database.
	 */
	constructor(options) {
		this.options = options;
	}

	/**
	 * Connect to the database.
	 * @return {undefined}
	 */
	async connect() {
		try {
			Winston.info(
				"Connecting to database " +
				"mysql://" + this.options.user + "@" + this.options.host + "/" + this.options.database + " ... "
			);
			const conn = await MySQL.createConnection({
				host : this.options.host,
				user : this.options.user,
				password : this.options.password,
				database : this.options.database,
				multipleStatements : true,
				connectTimeout : this.options.connectTimeout ? this.options.connectTimeout : timeout
			});
			Winston.info("Successfully connected to database!");
			this.connection = conn;
			await this._setupDatabase();
		}
		catch(err) {
			Winston.error("Connecting to database failed!", err);
			throw err;
		}
	}

	/**
	 * Sets up the database based on the schema file "schema.sql".
	 * @return {undefined}
	 */
	async _setupDatabase() {
		const data = await FS.readFile("schema.sql", {encoding : "utf8"});
		try {
			await this.connection.query(data);
			return;
		}
		catch(err) {
			Winston.error("An error occured while configuring database:", err);
			throw err;
		}
	}

	/**
	 * Stops the database by disconnecting gently.
	 * @return {undefined}
	 */
	async stop() {
		this.connection.end();
		return;
	}
}

QuotesExtension(Database);
TTSCacheExtension(Database);
UsersExtension(Database);
PermissionsExtension(Database);
MumbleUsersExtension(Database);
BassExtension(Database);
AutocompleteExtension(Database);
SoundsExtension(Database);
RecordsExtension(Database);
SettingsExtension(Database);
LogExtension(Database);
RSSExtension(Database);
DialogsExtension(Database);
UserStatsExtension(Database);

export default Database;
