import "babel-polyfill";

import * as MySQL from "promise-mysql";
import * as FS from "async-file";
import * as Winston from "winston";
const options = require("../../../config.json");

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
	"colorize": true,
	"level" : "verbose"
});

const timeout = 1000;

Winston.info("Migrating to database to 0.4.0");
const migrate = async function() {
	let conn;
	try {
		Winston.info("Connecting to database...");
		conn = await MySQL.createConnection({
			host : options.database.host,
			user : options.database.user,
			password : options.database.password,
			database : options.database.database,
			multipleStatements : true,
			connectTimeout : options.database.connectTimeout ? options.database.connectTimeout : timeout
		});
		Winston.info("Reading new schema...");
		const data = await FS.readFile("scripts/upgrades/0_4_0.sql", { encoding : "utf8" });
		Winston.info("Apply new database schema...");
		await conn.query(data);
		Winston.info("Done.");
	}
	catch(err) {
		Winston.error("Error during migration:", err);
	}
	conn.end();
};
migrate();
