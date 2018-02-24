/*
 * Imports
 */
import * as Winston from "winston";
import * as MySQL from "promise-mysql";
import * as FS from "async-file";

export * from "./mumble-users";
export * from "./permissions";
export * from "./settings";
export * from "./users";
export * from "./user-stats";

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
    const { host, user, password, database, socketPath, connectTimeout } = options;
    try {
        Winston.info(`Connecting to database mysql://${user}@${host}/${database} ... `);
        const conn = await MySQL.createConnection({
            host,
            user,
            password,
            database,
            socketPath,
            multipleStatements: true,
            connectTimeout: connectTimeout ? connectTimeout : timeout
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
