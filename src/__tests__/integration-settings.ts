import { signup, screenshot } from "./utils";

test("Settings page", async () => {
    await signup();
    await page.waitFor(600);
    await screenshot();
    const dropdown = await page.$("div.right.menu > div[role='listbox']");
    await dropdown.click();
    await screenshot();
    await (await dropdown.$$("div[role='option']"))[2].click();
    await screenshot();
});
