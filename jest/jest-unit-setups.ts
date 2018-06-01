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
Winston.remove(Winston.transports.Console);

// Mock modules.
jest.mock("mumble");
jest.mock("../src/config/server-config-factory");
jest.mock("../src/visualizer/executor");

// Mock the local storage.
class LocalStorageMock {
    private store: Object;

    constructor() {
        this.clear();
    }

    public clear() {
        this.store = {};
    }

    public getItem(key) {
        return this.store[key];
    }

    public setItem(key, value) {
        this.store[key] = value.toString();
    }

    public removeItem(key) {
        delete this.store[key];
    }
}
(window as any).localStorage = new LocalStorageMock();

// Mock the `baseUrl` provided by `config.js`.
(global as any).baseUrl = "example.com";

// Mock `requestAnimationFrame`.
(window as any).requestAnimationFrame = (callback, element) => {
    setTimeout(() => callback(10), 10);
};

beforeEach(async () => {
    global.tsdi = new TSDI();
    tsdi.enableComponentScanner();
    const databaseFactory = tsdi.get(DatabaseFactory);
    await databaseFactory.connect(true);
    const db = await tsdi.get(Connection);
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
    if (tsdi) {
        const db = tsdi.get(Connection);
        tsdi.close();
        await new Promise(resolve => {
            const check = () => {
                if (db.isConnected) { setTimeout(check, 10); }
                else { resolve(); }
            };
            check();
        });
    }
});
