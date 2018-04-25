import { TSDI } from "tsdi";
import * as Winston from "winston";
import { DatabaseFactory, MumbleFactory } from "./src/server";

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

let tsdi: TSDI;

// Setup TSDI.
beforeEach(() => {
    tsdi = new TSDI();
    tsdi.enableComponentScanner();
    (global as any).tsdi = tsdi;
});

afterEach(() => {
    tsdi.close();
});

jest.mock("./src/config/server-config-factory");
jest.mock("mumble");

Winston.remove(Winston.transports.Console);

// Prepare database.
beforeEach(async () => {
    const databaseFactory = tsdi.get(DatabaseFactory);
    await databaseFactory.connect(true);
});

// Prepare mmble.
beforeEach(async () => {
    await tsdi.get(MumbleFactory).connect();
});
