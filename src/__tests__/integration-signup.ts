import { browse, screenshot } from "./utils";

test("Signing up", async () => {
    const username = "Someone";
    const email = "someone@example.com";
    const password = "some secure password";

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
