import { screenshot, browse } from "./utils";

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
    await browse("/");
    await (await page.$("input[placeholder='Email']")).type(email);
    await (await page.$("input[placeholder='Password']")).type(password);
    await page.waitFor(100);
    await screenshot();
    await (await page.$("button[type='submit']")).click();
    await page.waitForSelector(".dimmer");
    await screenshot();
    await page.waitForSelector(".sidebar");
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

    const cachedPage = (await page.$x("//a[contains(text(), 'Cached Audio')]"))[0];
    await cachedPage.click();
    await page.waitFor(200);
    await screenshot();

    await (await page.$x("//button[contains(text(), 'Last 5 minutes')]"))[0].click();
    await screenshot();

    await mumbleAgent.play();
    await page.waitFor(1000);
    await screenshot();

    await page.waitFor(10000);
    await mumbleAgent.play();
    await page.waitFor(1000);
    await screenshot();
});
