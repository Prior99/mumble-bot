import { browse, screenshot } from "./utils";

test("Signing up", async () => {
    const username = "Someone";
    const email = "someone@example.com";
    const password = "some secure password";

    await browse("/");
    await screenshot();
    await (await page.$("a[href='/signup']")).click();
    await screenshot();
    await (await page.$("input[placeholder='Username']")).type(username);
    await (await page.$("input[placeholder='Email']")).type(email);
    await (await page.$("input[placeholder='Password']")).type(password);
    await (await page.$("input[placeholder='Repeat']")).type("some");
    await page.waitFor(100);
    await screenshot();
    for (let i = 0; i < 4; ++i) {
        await page.keyboard.press("Backspace");
    }
    await (await page.$("input[placeholder='Repeat']")).type(password);
    await page.waitFor(100);
    await screenshot();
    await (await page.$("button[type='submit']")).click();
    await screenshot();
});
