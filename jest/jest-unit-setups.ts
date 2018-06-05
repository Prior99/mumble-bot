import { TSDI } from "tsdi";
import { Connection } from "typeorm";
import * as Winston from "winston";
import { DatabaseFactory, MumbleFactory, AudioInput } from "../src/server";

process.on("unhandledRejection", err => {
    console.error(`Unhandled Promise rejection: ${err && err.message}`);
    console.error(err);
});
process.on("uncaughtException", err => {
    console.error(`Unhandled Promise rejection: ${err && err.message}`);
    console.error(err);
});

declare namespace global {
    let tsdi: TSDI;
}
declare let tsdi: TSDI;

// Setup winston.
if (!process.env["DEBUG"]) { Winston.remove(Winston.transports.Console); }

// Mock modules.
jest.mock("mumble");
jest.mock("../src/config/server-config-factory");
jest.mock("../src/visualizer/executor");

// Mock the `baseUrl` provided by `config.js`.
(global as any).baseUrl = "example.com";

beforeEach(async () => {
    global.tsdi = new TSDI();
    tsdi.enableComponentScanner();
    const databaseFactory = tsdi.get(DatabaseFactory);
    await databaseFactory.connect();
    const db = tsdi.get(Connection);
    await db.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    await db.runMigrations();
    await tsdi.get(MumbleFactory).connect();
    await tsdi.get(AudioInput).initialize();
});

afterEach(async () => {
    const databaseFactory = tsdi.get(DatabaseFactory);
    await databaseFactory.conn.close();
    tsdi.close();
});
