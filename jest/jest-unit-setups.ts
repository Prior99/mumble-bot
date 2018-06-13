import { TSDI } from "tsdi";
import * as Winston from "winston";

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
});

afterEach(async () => {
    tsdi.close();
});
