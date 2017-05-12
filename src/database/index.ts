/*
 * Imports
 */
import * as Winston from "winston";
import * as MySQL from "promise-mysql";
import * as FS from "async-file";

export * from "./dialogs";
export * from "./log";
export * from "./mumbleUsers";
export * from "./permissions";
export * from "./records";
export * from "./settings";
export * from "./sounds";
export * from "./users";
export * from "./userstats";

const timeout = 4000;

async function setupDatabase(connection) {
    const data = await FS.readFile("schema.sql", { encoding: "utf8" });
    try {
        await connection.query(data);
        return;
    }
    catch (err) {
        Winston.error("An error occured while configuring database:", err);
        throw err;
    }
}

export async function connectDatabase(options) {
    try {
        Winston.info(
            "Connecting to database " +
            "mysql://" + options.user + "@" + options.host + "/" + options.database + " ... "
        );
        const conn = await MySQL.createConnection({
            host: options.host,
            user: options.user,
            password: options.password,
            database: options.database,
            multipleStatements: true,
            connectTimeout: options.connectTimeout ? options.connectTimeout : timeout
        });
        Winston.info("Successfully connected to database!");
        await setupDatabase(conn);
        return conn;
    }
    catch (err) {
        Winston.error("Connecting to database failed!", err);
        throw err;
    }
}
