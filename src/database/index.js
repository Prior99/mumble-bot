/*
 * Imports
 */
import * as Winston from "winston";
import * as MySQL from "promise-mysql";
import * as FS from "fs-promise";

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
	 * @param {callback} callback - Called once the connection is up and running.
	 */
	constructor(options, callback) {
		this.pool = MySQL.createPool({
			host : options.host,
			user : options.user,
			password : options.password,
			database : options.database,
			multipleStatements : true,
			connectTimeout : options.connectTimeout ? options.connectTimeout : timeout
		});
		Winston.info(
			"Connecting to database mysql://" + options.user + "@" + options.host + "/" + options.database + " ... "
		);
		this.pool.getConnection((err, conn) => {
			if(err) {
				Winston.error("Connecting to database failed!");
				if(callback) { callback(err); }
				else { throw err; }
			}
			else {
				conn.release();
				Winston.info("Successfully connected to database!");
				this._setupDatabase(callback);
			}
		});
	}
	/**
	 * Sets up the database based on the schema file "schema.sql".
	 * @return {undefined}
	 */
	async _setupDatabase() {
		const data = await FS.readFile("schema.sql", {encoding : "utf8"});
		try {
			await this.pool.query(data);
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
		await this.pool.end();
	}
}

require("./quotes.js")(Database);
require("./ttscache.js")(Database);
require("./users.js")(Database);
require("./permissions.js")(Database);
require("./mumbleUsers.js")(Database);
require("./bass.js")(Database);
require("./autocomplete.js")(Database);
require("./sounds.js")(Database);
require("./records.js")(Database);
require("./settings.js")(Database);
require("./log.js")(Database);
require("./rss.js")(Database);
require("./dialogs.js")(Database);
require("./userstats.js")(Database);

export default Database;
