/*
 * Imports
 */
import "babel-polyfill";
import "array.prototype.find";
import Mumble from "mumble";
import Bot from "./src";
import Winston from "winston";
import * as FS from "fs";
import Database from "./src/database";
/*
 * Winston
 */
import Mysql from "winston-mysql-transport";

require('source-map-support').install();

/**
 * Pads the given number with zeros in front.
 * @param {number} number - Number to pad with zeros.
 * @param {number} len - Amount of digits the final string should have.
 * @return {string} - The zero padded number.
 */
const fillZero = function(number, len) {
	number = "" + number;
	while(number.length < len) {
		number = "0" + number;
	}
	return number;
}

/**
 * Returns the timestamp formatted as yyyy-mm-dd hh:mm:ss
 * @return {String} - the formatted timestamp.
 */
const timestampFunction = function() {
	const d = new Date();
	const javascriptYearZero = 1900;
	const actualYear = d.getYear() + javascriptYearZero;
	return actualYear + "-" + fillZero(d.getMonth() + 1, 2) + "-" + fillZero(d.getDate(), 2) + " " +
		fillZero(d.getHours(), 2) + ":" + fillZero(d.getMinutes(), 2) + ":" + fillZero(d.getSeconds(), 2);
};

Winston.remove(Winston.transports.Console);
Winston.add(Winston.transports.Console, {
	"colorize": true,
	timestamp: timestampFunction,
	"level" : "verbose"
});

Winston.add(Winston.transports.File, {
	filename : "bot.log",
	maxsize : "64000",
	maxFiles : 7,
	json: false,
	level : "verbose",
	colorize: true,
	timestamp: timestampFunction
});
/*
 * Code
 */
const options = require("../../config.json");

const mumbleOptions = {};

if(options.key && options.cert) {
	mumbleOptions.key = FS.readFileSync(options.key);
	mumbleOptions.cert = FS.readFileSync(options.cert);
}
else {
	Winston.warn("Connecting without certificate. Connection will be unsecured, bot will not be able to register!");
}

/**
 * Stops the database connection.
 * @param {object} database - Connection to the database to close.
 * @param {VoidCallback} callback - Called once the connection to the database is closed.
 * @return {undefined}
 */
const stopDatabase = async function(database, callback) {
	Winston.info("Stopping database ... ");
	await database.stop();
	Winston.info("Database stopped.");
	callback();
}

/**
 * Stops the mumble connection.
 * @param {object} connection - Connection to the mumble server.
 * @param {VoidCallback} callback - Called once the connection is closed.
 * @return {undefined}
 */
const stopMumble = function(connection, callback) {
	Winston.info("Stopping connection to mumble ... ");
	connection.on("disconnect", () => {
		Winston.info("Connection to mumble stopped. ");
		callback();
	});
	connection.disconnect();
}

/**
 * Called once the database was started.
 * @param {object} connection - Connection to the mumble server.
 * @param {object} database - Initialized instance of database.
 * @return {undefined}
 */
const databaseStarted = function(connection, database) {
	Winston.transports.Mysql.prototype.level = "verbose";
	Winston.add(Winston.transports.Mysql, {
		host : options.database.host,
		user : options.database.user,
		password : options.database.password,
		database : options.database.database,
		table : "Log"
	});
	let bot;
	try {
		bot = new Bot(connection, options, database);
	}
	catch(err) {
		Winston.error("Error starting the bot:", err);
		return;
	}
	Winston.info("Joining channel: " + options.channel);
	bot.join(options.channel);
	bot.say("Ich grüße euch!");
	bot.on("shutdown", () => {
		stopDatabase(database, () => {
			stopMumble(connection, () => {
				process.exit();
			});
		});
	});
	let killed = false;

	/**
	 * Called when SIGINT is received either through CTRL+C or through the bot.
	 * @return {undefined}
	 */
	const sigint = function() {
		if(killed) {
			Winston.error("CTRL^C detected. Terminating!");
			process.exit(1);debugger;
		}
		else {
			killed = true;
			Winston.warn("CTRL^C detected. Secure shutdown initiated.");
			Winston.warn("Press CTRL^C again to terminate at your own risk.");
			bot.shutdown();
		}
	}
	bot.on("SIGINT", () => sigint());
	process.on("SIGINT", () => sigint());
}

/**
 * Starts the bot using the passed already initialized mumble connection.
 * @param {object} connection - Already initialized mumble connection.
 * @return {undefined}
 */
const startup = async function(connection) {
	const database = new Database(options.database);
	try {
		await database.connect();
	}
	catch(err) {
		Winston.error("Unable to connect to database. Quitting.");
		database.stop();
		return;
	}
	databaseStarted(connection, database);
}

Mumble.connect("mumble://" + options.url, mumbleOptions, (err, connection) => {
	if(err) {
		throw err;
	}
	else {
		connection.on("error", (data) => Winston.error("An error with the mumble connection has occured:", data));
		connection.authenticate(options.name, options.password);
		connection.on("ready", () => startup(connection));
	}
});
