import { connect } from "mumble";
import { Bot } from "./bot";
import * as Winston from "winston";
import * as FS from "fs";
import { connectDatabase } from "./database";
import { setupWinston } from "./utils/winston";
/*
 * Winston
 */
import "winston-mysql-transport";

export * from "./bot";

setupWinston("bot.log");

const options: any = require(`${__dirname}/../config.json`); // tslint:disable-line

const mumbleOptions: any = {};

if (options.key && options.cert) {
    mumbleOptions.key = FS.readFileSync(options.key);
    mumbleOptions.cert = FS.readFileSync(options.cert);
}
else {
    Winston.warn("Connecting without certificate. Connection will be unsecured, bot will not be able to register!");
}

/**
 * Stops the database connection.
 * @param database Connection to the database to close.
 * @param callback Called once the connection to the database is closed.
 */
const stopDatabase = async (database, callback: Function) => {
    Winston.info("Stopping database ... ");
    await database.end();
    Winston.info("Database stopped.");
    callback();
};

/**
 * Stops the mumble connection.
 * @param connection Connection to the mumble server.
 * @param callback Called once the connection is closed.
 */
const stopMumble = function(connection, callback: Function) {
    Winston.info("Stopping connection to mumble ... ");
    connection.on("disconnect", () => {
        Winston.info("Connection to mumble stopped. ");
        callback();
    });
    connection.disconnect();
};

/**
 * Called once the database was started.
 * @param connection Connection to the mumble server.
 * @param database Initialized instance of database.
 */
function databaseStarted(connection, database) {
    Winston.add((Winston.transports as any).Mysql, {
        host: options.database.host,
        user: options.database.user,
        password: options.database.password,
        database: options.database.database,
        table: "Log"
    });
    let bot;
    try {
        bot = new Bot(connection, options, database);
    }
    catch (err) {
        Winston.error("Error starting the bot:", err);
        return;
    }
    Winston.info(`Joining channel: ${options.channel}`);
    bot.join(options.channel);
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
    const sigint = () => {
        if (killed) {
            Winston.error("CTRL^C detected. Terminating!");
            process.exit(1);
        }
        else {
            killed = true;
            Winston.warn("CTRL^C detected. Secure shutdown initiated.");
            Winston.warn("Press CTRL^C again to terminate at your own risk.");
            bot.shutdown();
        }
    };
    bot.on("SIGINT", () => sigint());
    process.on("SIGINT", () => sigint());
}

/**
 * Starts the bot using the passed already initialized mumble connection.
 * @param connection Already initialized mumble connection.
 */
async function startup(connection) {
    let database;
    try {
        database = await connectDatabase(options.database);
    } catch (err) {
        Winston.error("Unable to connect to database. Quitting.");
        database.stop();
        return;
    }
    try {
        databaseStarted(connection, database);
    } catch (err) {
        console.error(err);
    }
}

connect(`mumble://${options.url}`, mumbleOptions, (err, connection) => {
    if (err) {
        throw err;
    }
    else {
        connection.on("error", (data) => Winston.error("An error with the mumble connection has occured:", data));
        connection.authenticate(options.name, options.password);
        connection.on("ready", () => startup(connection));
    }
});
