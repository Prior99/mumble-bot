import "babel-polyfill";

import * as MySQL from "promise-mysql";
import * as FS from "async-file";
import * as Winston from "winston";
import FFMpeg from "fluent-ffmpeg";

const options = require("../../../config.json");
const msInS = 1000;
const audioFreq = 48000;
const timeout = 1000;

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
	"colorize": true,
	"level" : "verbose"
});

Winston.info("Migrating to database to 0.3.0");

const migrate = async function() {
	try {
		Winston.info("Connecting to database...");
		const conn = await MySQL.createConnection({
			host : options.database.host,
			user : options.database.user,
			password : options.database.password,
			database : options.database.database,
			multipleStatements : true,
			connectTimeout : options.database.connectTimeout ? options.database.connectTimeout : timeout
		});
		Winston.info("Reading new schema...");
		const data = await FS.readFile("scripts/upgrades/0_3_0.sql", { encoding : "utf8" });
		Winston.info("Apply new database schema...");
		await conn.query(data);
		Winston.info("Reading length of all records in the database from file...");
		const records = await conn.query("SELECT id FROM Records");
		Winston.info(records.length + " records need to be processed...");
		for(const record of records) {
			const file = "sounds/recorded/" + record.id;
			let samplesTotal = 0;
			await new Promise((resolve, reject) => { //eslint-disable-line no-loop-func
				const ffmpeg = FFMpeg(file)
				.format("s16le")
				.audioChannels(1)
				.audioFrequency(audioFreq);
				ffmpeg.stream()
					.on("data", (chunk) => samplesTotal += chunk.length / 2)
					.on("end", async () => { //eslint-disable-line no-loop-func
						const duration = samplesTotal / audioFreq;
						Winston.info("Record " + record.id + " has duration of " + duration + "s");
						await conn.query("UPDATE Records SET duration = ? WHERE id = ?", [duration, record.id]);
						resolve();
					});
			})
		}
		conn.end();
	}
	catch(err) {
		Winston.error("Error during migration:", err);
	}
};

migrate();
