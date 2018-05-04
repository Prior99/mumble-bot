import { signup, screenshot, browse } from "./utils";

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
    await page.waitFor(600);
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
    const superUserCheckbox = (await page.$x("//label[contains(text(), 'Someone')]"))[0];
    await superUserCheckbox.click();
});

test("Listing all users", async () => {
    const usersLink = (await page.$x("//a[contains(text(), 'Users')]"))[0];
    await usersLink.click();
    await page.waitFor(600);
    await screenshot();
});

test("Recording", async () => {
    await mumbleAgent.play();
});
