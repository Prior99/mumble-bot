import { TSDI } from "tsdi";
import * as Winston from "winston";
import { DatabaseFactory, MumbleFactory, AudioInput } from "../src/server";

process.on("unhandledRejection", err => {
    console.error(`Unhandled Promise rejection: ${err.message}`);
    console.error(err);
});
process.on("uncaughtException", err => {
    console.error(`Unhandled Promise rejection: ${err.message}`);
    console.error(err);
});

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

// Setup TSDI.
let tsdi: TSDI;
beforeEach(() => {
    tsdi = new TSDI();
    tsdi.enableComponentScanner();
    (global as any).tsdi = tsdi;
});

// Prepare database.
beforeEach(async () => {
    const databaseFactory = tsdi.get(DatabaseFactory);
    await databaseFactory.connect(true);
    await tsdi.get(MumbleFactory).connect();
    await tsdi.get(AudioInput).initialize();
});

afterEach(() => {
    tsdi.close();
});
