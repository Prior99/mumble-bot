import * as puppeteer from "puppeteer";
import { readFileSync } from "fs";
import { setupJestScreenshot } from "jest-screenshot";
import { MumbleAgent, mumbleAgent } from "./mumble-agent";

setupJestScreenshot();

const key = readFileSync(`${__dirname}/agent.key`);
const cert = readFileSync(`${__dirname}/agent.cert`);

async function setupMumble() {
    global.mumbleAgent = await mumbleAgent("Someone", process.env["MUMBLE_URL"] || "localhost", { key, cert }, "admin");
    const superUser = await mumbleAgent("SuperUser", process.env["MUMBLE_URL"] || "localhost", {}, "admin");
    if (!superUser.connection.channelByName("Channel A")) {
        superUser.connection.rootChannel.addSubChannel("Channel A", {});
    }
    if (!superUser.connection.channelByName("Channel B")) {
        superUser.connection.rootChannel.addSubChannel("Channel B", {});
    }
    if (!superUser.connection.channelByName("Channel C")) {
        superUser.connection.rootChannel.addSubChannel("Channel C", {});
    }
    const someoneAsSeenBySuperUser = superUser.connection.userByName("Someone");
    if (!someoneAsSeenBySuperUser.isRegistered()) {
        someoneAsSeenBySuperUser.once("id", superUser.disconnect);
        someoneAsSeenBySuperUser.register();
    } else {
        superUser.disconnect();
    }
}

beforeAll(async () => {
    try {
        await setupMumble();
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: process.env.NO_HEADLESS !== "true",
        });
        global.browser = browser;
        const page = await global.browser.newPage();
        page.setViewport({ width: 1920, height: 1080 });
        global.page = page;
    } catch (err) {
        console.error("Unable to start browser.", err);
    }
});

afterAll(async () => {
    global.browser.close();
    await global.mumbleAgent.disconnect();
});

jest.setTimeout(60000);
