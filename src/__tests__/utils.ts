import "jest-screenshot";

export async function browse(url: string): Promise<void> {
    await page.goto(`http://localhost:3020${url}`, { waitUntil: "networkidle0" });
}

export async function screenshot(fullPage = true) {
    const result = await page.screenshot({ fullPage });
    expect(result).toMatchImageSnapshot();
}
