import * as puppeteer from "puppeteer";
import { setupJestScreenshot } from "jest-screenshot";
 
setupJestScreenshot();

beforeAll(async () => {
    try {
        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: process.env.NO_HEADLESS !== "true",
        });
        global.browser = browser;
    } catch (err) {
        console.error("Unable to start browser.", err);
    }
});

afterAll(() => {
    global.browser.close();
});

beforeEach(async () => {
    const page = await browser.newPage();
    page.setViewport({ width: 1920, height: 1080 });
    global.page = page;
});

jest.setTimeout(60000);
