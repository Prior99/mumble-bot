import { screenshot, browse } from "./utils";
import { fft, util } from "fft-js";
import { writeFileSync } from "fs";

const username = "Someone";
const email = "someone@example.com";
const password = "some secure password";

test("Signing up", async () => {
    // Browse to login page.
    await browse("/");
    await screenshot();
    // Click on link for signup.
    await (await page.$("a[href='/signup']")).click();
    await screenshot();
    // Type in username, email, password, but repeat wrong password.
    await (await page.$("input[placeholder='Username']")).type(username);
    await (await page.$("input[placeholder='Email']")).type(email);
    await (await page.$("input[placeholder='Password']")).type(password);
    await (await page.$("input[placeholder='Repeat']")).type("some");
    await page.waitFor(100);
    await screenshot();
    // Delete the old password and type in the correct one.
    for (let i = 0; i < 4; ++i) {
        await page.keyboard.press("Backspace");
    }
    await (await page.$("input[placeholder='Repeat']")).type(password);
    await page.waitFor(100);
    await screenshot();
    // Click on submit.
    await (await page.$("button[type='submit']")).click();
    await page.waitForSelector(".dimmer");
    await screenshot();
});

test("Logging in", async() => {
    // Reload the page.
    await browse("/");
    // Enter credentials.
    await (await page.$("input[placeholder='Email']")).type(email);
    await (await page.$("input[placeholder='Password']")).type(password);
    await page.waitFor(100);
    await screenshot();
    // Wait for the page to finish loading.
    await (await page.$("button[type='submit']")).click();
    await page.waitForSelector(".sidebar");
    await page.waitFor(300);
    await screenshot();
});

test("Linking a user", async () => {
    // Open the dropdown from the top right corner.
    const dropdown = await page.$("div.right.menu > div[role='listbox']");
    await dropdown.click();
    await screenshot();
    // Click on the "Settings" page.
    await (await dropdown.$$("div[role='option']"))[2].click();
    await screenshot();
    const someoneCheckbox = (await page.$x("//label[contains(text(), 'Someone')]"))[0];
    await someoneCheckbox.click();
    await page.waitFor(200);
    await screenshot();
});

test("Listing all users", async () => {
    const usersLink = (await page.$x("//a[contains(text(), 'Users')]"))[0];
    await usersLink.click();
    await page.waitFor(600);
    await screenshot();
});

test("Recording", async () => {
    await page.waitForSelector(".sidebar i.check");
    // Browse to Cached Audio page.
    const cachedPage = (await page.$x("//a[contains(text(), 'Cached Audio')]"))[0];
    await cachedPage.click();
    await page.waitFor(200);
    await screenshot();
    // Watch the last five minutes.
    await (await page.$x("//button[contains(text(), 'Last 5 minutes')]"))[0].click();
    await screenshot();
    // Play a sound and wait for it to appear on screen.
    await mumbleAgent.play();
    await page.waitFor(1000);
    await screenshot();
    // Play another sound 10 seconds later and wait for it to appear on screen.
    await page.waitFor(10000);
    await mumbleAgent.play();
    await page.waitFor(1000);
    await screenshot();
    // Click on the Audio.
    await (await page.$(".grid .row .column .card .inverted.violet")).click();
    await page.waitFor(500);
    await page.waitForSelector("img.image");
    await screenshot();
    // Input a description.
    await (await page.$("input[placeholder*='Recording from']")).type("My fancy recording");
    await screenshot();
    // Click save.
    await (await page.$("button.green i.icon.checkmark")).click();
    await page.waitFor(500);
    await screenshot();
});

test("Sounds", async () => {
    // Take a look at the new recording in the Sounds page.
    const soundsLink = (await page.$x("//a[contains(text(), 'Sounds')]"))[0];
    await soundsLink.click();
    await page.waitForSelector(".card img.image");
    await screenshot();
    // Inspect the details page for the recording.
    await (await page.$(".card a[href*='/sound/']")).click();
    await page.waitForSelector(".table");
    await screenshot();
    // Playback the recording.
    await (await page.$("button.green")).click();
    const voice = [];
    mumbleAgent.connection.userByName("test-bot").outputStream(true).on("data", (data: Buffer) => {
        for (let i = 0; i < data.length; i += 2) {
            const slice = data.slice(i, i + 1);
            const floatNumber = new Buffer([ slice[0], slice[1], 0, 0 ]).readFloatLE() / 2 - 1;
            voice.push(floatNumber);
        }
    });
    await page.waitFor(6000);
    const phasors = fft(voice.slice(0, Math.pow(2, 17)));
    const frequencies = util.fftFreq(phasors, 48000);
    expect(frequencies.map(num => Math.round(num))).toMatchSnapshot();
});
