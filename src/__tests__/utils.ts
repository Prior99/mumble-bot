import "jest-screenshot";

export async function browse(url: string): Promise<void> {
    await page.goto(`http://localhost:3020${url}`, {
        waitUntil: "networkidle0",
        timeout: 60000
    });
}

export async function screenshot(fullPage = true) {
    const result = await page.screenshot({ fullPage });
    expect(result).toMatchImageSnapshot();
}

export async function signup(): Promise<void> {
    const username = "Mumblebot-User";
    const email = "anotherone@example.com";
    const password = "some secure password";

    await browse("/signup");
    await (await page.$("input[placeholder='Username']")).type(username);
    await (await page.$("input[placeholder='Email']")).type(email);
    await (await page.$("input[placeholder='Password']")).type(password);
    await (await page.$("input[placeholder='Repeat']")).type(password);
    await (await page.$("button[type='submit']")).click();
    await page.waitFor(300);
}
